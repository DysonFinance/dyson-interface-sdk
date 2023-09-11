import { Buffer } from 'buffer'
export function atob(data: string) {
  if (typeof window !== 'undefined') {
    return window.atob.call(null, data)
  } else {
    return Buffer.from(data, 'base64').toString('binary')
  }
}

export function btoa(data: string) {
  if (typeof window !== 'undefined') {
    return window.btoa.call(null, data)
  } else {
    return Buffer.from(data, 'binary').toString('base64')
  }
}
