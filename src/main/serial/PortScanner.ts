import { SerialPort } from 'serialport'
import { PortInfo } from '../types'

// CH340 chip used in Creality Ender 3 V3 SE
const CREALITY_VENDOR_IDS = ['1a86']
const CREALITY_PRODUCT_IDS = ['7523']

export class PortScanner {
  async listPorts(): Promise<PortInfo[]> {
    const ports = await SerialPort.list()
    return ports.map((p) => ({
      path: p.path,
      manufacturer: p.manufacturer,
      serialNumber: p.serialNumber,
      pnpId: p.pnpId,
      vendorId: p.vendorId,
      productId: p.productId,
      friendlyName: (p as Record<string, unknown>).friendlyName as string | undefined,
    }))
  }

  async findCrealityPort(): Promise<string | null> {
    const ports = await this.listPorts()
    const creality = ports.find(
      (p) =>
        (p.vendorId && CREALITY_VENDOR_IDS.includes(p.vendorId.toLowerCase())) ||
        (p.productId && CREALITY_PRODUCT_IDS.includes(p.productId.toLowerCase())) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes('ch340'))
    )
    return creality?.path ?? null
  }
}
