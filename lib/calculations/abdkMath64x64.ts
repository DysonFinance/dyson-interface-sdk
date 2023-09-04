const MAX_64x64 = 0x7fffffffffffffffffffffffffffffffn

export const exp_2 = (bigIntPower: bigint) => {
  if (bigIntPower >= BigInt(0x400000000000000000)) {
    console.error('bigIntPower >= 0x400000000000000000')
    return null
  }

  if (bigIntPower < BigInt(-0x400000000000000000)) {
    console.error('bigIntPower < -0x400000000000000000')
    return 0
  }

  let result = BigInt(0x80000000000000000000000000000000)

  if ((bigIntPower & BigInt(0x8000000000000000)) > 0) {
    result = (result * BigInt(0x16a09e667f3bcc908b2fb1366ea957d3en)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4000000000000000)) > 0) {
    result = (result * BigInt(0x1306fe0a31b7152de8d5a46305c85edecn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2000000000000000)) > 0) {
    result = (result * BigInt(0x1172b83c7d517adcdf7c8c50eb14a791fn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1000000000000000)) > 0) {
    result = (result * BigInt(0x10b5586cf9890f6298b92b71842a98363n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x800000000000000)) > 0) {
    result = (result * BigInt(0x1059b0d31585743ae7c548eb68ca417fdn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x400000000000000)) > 0) {
    result = (result * BigInt(0x102c9a3e778060ee6f7caca4f7a29bde8n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x200000000000000)) > 0) {
    result = (result * BigInt(0x10163da9fb33356d84a66ae336dcdfa3fn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100000000000000)) > 0) {
    result = (result * BigInt(0x100b1afa5abcbed6129ab13ec11dc9543n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x80000000000000)) > 0) {
    result = (result * BigInt(0x10058c86da1c09ea1ff19d294cf2f679bn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x40000000000000)) > 0) {
    result = (result * BigInt(0x1002c605e2e8cec506d21bfc89a23a00fn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x20000000000000)) > 0) {
    result = (result * BigInt(0x100162f3904051fa128bca9c55c31e5dfn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x10000000000000)) > 0) {
    result = (result * BigInt(0x1000b175effdc76ba38e31671ca939725n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x8000000000000)) > 0) {
    result = (result * BigInt(0x100058ba01fb9f96d6cacd4b180917c3dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4000000000000)) > 0) {
    result = (result * BigInt(0x10002c5cc37da9491d0985c348c68e7b3n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2000000000000)) > 0) {
    result = (result * BigInt(0x1000162e525ee054754457d5995292026n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1000000000000)) > 0) {
    result = (result * BigInt(0x10000b17255775c040618bf4a4ade83fcn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x800000000000)) > 0) {
    result = (result * BigInt(0x1000058b91b5bc9ae2eed81e9b7d4cfabn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x400000000000)) > 0) {
    result = (result * BigInt(0x100002c5c89d5ec6ca4d7c8acc017b7c9n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x200000000000)) > 0) {
    result = (result * BigInt(0x10000162e43f4f831060e02d839a9d16dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100000000000)) > 0) {
    result = (result * BigInt(0x10000162e43f4f831060e02d839a9d16dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100000000000)) > 0) {
    result = (result * BigInt(0x100000b1721bcfc99d9f890ea06911763n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x80000000000)) > 0) {
    result = (result * BigInt(0x10000058b90cf1e6d97f9ca14dbcc1628n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x40000000000)) > 0) {
    result = (result * BigInt(0x1000002c5c863b73f016468f6bac5ca2bn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x20000000000)) > 0) {
    result = (result * BigInt(0x100000162e430e5a18f6119e3c02282a5n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x10000000000)) > 0) {
    result = (result * BigInt(0x1000000b1721835514b86e6d96efd1bfen)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x8000000000)) > 0) {
    result = (result * BigInt(0x100000058b90c0b48c6be5df846c5b2efn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4000000000)) > 0) {
    result = (result * BigInt(0x10000002c5c8601cc6b9e94213c72737an)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2000000000)) > 0) {
    result = (result * BigInt(0x1000000162e42fff037df38aa2b219f06n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1000000000)) > 0) {
    result = (result * BigInt(0x10000000b17217fba9c739aa5819f44f9n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x800000000)) > 0) {
    result = (result * BigInt(0x1000000058b90bfcdee5acd3c1cedc823n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x400000000)) > 0) {
    result = (result * BigInt(0x100000002c5c85fe31f35a6a30da1be50n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x200000000)) > 0) {
    result = (result * BigInt(0x10000000162e42ff0999ce3541b9fffcfn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100000000)) > 0) {
    result = (result * BigInt(0x100000000b17217f80f4ef5aadda45554n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x80000000)) > 0) {
    result = (result * BigInt(0x10000000058b90bfbf8479bd5a81b51adn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x40000000)) > 0) {
    result = (result * BigInt(0x1000000002c5c85fdf84bd62ae30a74ccn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x20000000)) > 0) {
    result = (result * BigInt(0x100000000162e42fefb2fed257559bdaan)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x10000000)) > 0) {
    result = (result * BigInt(0x1000000000b17217f7d5a7716bba4a9aen)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x8000000)) > 0) {
    result = (result * BigInt(0x100000000058b90bfbe9ddbac5e109ccen)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4000000)) > 0) {
    result = (result * BigInt(0x10000000002c5c85fdf4b15de6f17eb0dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2000000)) > 0) {
    result = (result * BigInt(0x1000000000162e42fefa494f1478fde05n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1000000)) > 0) {
    result = (result * BigInt(0x10000000000b17217f7d20cf927c8e94cn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x800000)) > 0) {
    result = (result * BigInt(0x1000000000058b90bfbe8f71cb4e4b33dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x400000)) > 0) {
    result = (result * BigInt(0x100000000002c5c85fdf477b662b26945n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x200000)) > 0) {
    result = (result * BigInt(0x10000000000162e42fefa3ae53369388cn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100000)) > 0) {
    result = (result * BigInt(0x100000000000b17217f7d1d351a389d40n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x80000)) > 0) {
    result = (result * BigInt(0x10000000000058b90bfbe8e8b2d3d4eden)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x40000)) > 0) {
    result = (result * BigInt(0x1000000000002c5c85fdf4741bea6e77en)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x20000)) > 0) {
    result = (result * BigInt(0x100000000000162e42fefa39fe95583c2n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x10000)) > 0) {
    result = (result * BigInt(0x1000000000000b17217f7d1cfb72b45e1n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x8000)) > 0) {
    result = (result * BigInt(0x100000000000058b90bfbe8e7cc35c3f0n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4000)) > 0) {
    result = (result * BigInt(0x10000000000002c5c85fdf473e242ea38n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2000)) > 0) {
    result = (result * BigInt(0x1000000000000162e42fefa39f02b772cn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1000)) > 0) {
    result = (result * BigInt(0x10000000000000b17217f7d1cf7d83c1an)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x800)) > 0) {
    result = (result * BigInt(0x1000000000000058b90bfbe8e7bdcbe2en)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x400)) > 0) {
    result = (result * BigInt(0x100000000000002c5c85fdf473dea871fn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x200)) > 0) {
    result = (result * BigInt(0x10000000000000162e42fefa39ef44d91n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x100)) > 0) {
    result = (result * BigInt(0x100000000000000b17217f7d1cf79e949n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x80)) > 0) {
    result = (result * BigInt(0x10000000000000058b90bfbe8e7bce544n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x40)) > 0) {
    result = (result * BigInt(0x1000000000000002c5c85fdf473de6ecan)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x20)) > 0) {
    result = (result * BigInt(0x100000000000000162e42fefa39ef366fn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x10)) > 0) {
    result = (result * BigInt(0x1000000000000000b17217f7d1cf79afan)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x8)) > 0) {
    result = (result * BigInt(0x100000000000000058b90bfbe8e7bcd6dn)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x4)) > 0) {
    result = (result * BigInt(0x10000000000000002c5c85fdf473de6b2n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x2)) > 0) {
    result = (result * BigInt(0x1000000000000000162e42fefa39ef358n)) >> BigInt(128)
  }
  if ((bigIntPower & BigInt(0x1)) > 0) {
    result = (result * BigInt(0x10000000000000000b17217f7d1cf79abn)) >> BigInt(128)
  }

  result = result >> (BigInt(63) - (bigIntPower >> BigInt(64)))

  if (result > MAX_64x64) {
    console.error('result > MAX_64x64')
    return null
  }
  return result
}

export const divuu = (x: bigint, y: bigint) => {
  if (y === BigInt(0)) {
    return null
  }

  let result: bigint

  if (x <= 0xffffffffffffffffffffffffffffffffffffffffffffffffn) {
    result = (x << BigInt(64)) / y
  } else {
    let msb = BigInt(192)
    let xc = x >> BigInt(192)

    if (xc >= BigInt(0x100000000)) {
      xc >>= BigInt(32)
      msb += BigInt(32)
    }

    if (xc >= BigInt(0x10000)) {
      xc >>= BigInt(16)
      msb += BigInt(16)
    }

    if (xc >= BigInt(0x100)) {
      xc >>= BigInt(8)
      msb += BigInt(8)
    }

    if (xc >= BigInt(0x10)) {
      xc >>= BigInt(4)
      msb += BigInt(4)
    }

    if (xc >= BigInt(0x4)) {
      xc >>= BigInt(2)
      msb += BigInt(2)
    }

    if (xc >= BigInt(0x2)) {
      msb += BigInt(1)
    }

    result =
      (x << (BigInt(255) - msb)) / (((y - BigInt(1)) >> (msb - BigInt(191))) + BigInt(1))
    if (result > 0xffffffffffffffffffffffffffffffffn) {
      return null
    }

    const hi = result * (y >> BigInt(128))
    let lo = result * (y & 0xffffffffffffffffffffffffffffffffn)

    let xh = x >> BigInt(192)
    let xl = x << BigInt(64)

    if (xl < lo) {
      xh -= BigInt(1)
    }

    xl -= lo
    lo = hi << BigInt(128)

    if (xl < lo) {
      xh -= BigInt(1)
    }
    xl -= lo

    if (xh !== hi >> BigInt(128)) {
      return null
    }

    result += xl / y
  }

  if (result > 0xffffffffffffffffffffffffffffffffn) {
    return null
  }
  return result
}

export const divu = (x: bigint, y: bigint) => {
  if (y === BigInt(0)) {
    return null
  }
  const result = divuu(x, y)
  if (result && result > MAX_64x64) {
    return null
  }
  return result
}

export const mulu = (x: bigint, y: bigint) => {
  if (y === BigInt(0)) {
    return BigInt(0)
  }
  if (x < 0) {
    return null
  }

  const lo = (x * (y & 0xffffffffffffffffffffffffffffffffn)) >> BigInt(64)
  let hi = x * (y >> BigInt(128))

  if (hi > 0xffffffffffffffffffffffffffffffffffffffffffffffffn) {
    return null
  }

  hi <<= BigInt(64)
  if (hi > 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn - lo) {
    return null
  }
  return hi + lo
}
