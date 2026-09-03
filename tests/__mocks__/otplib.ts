export class TOTP {
  generateSecret() {
    return 'MOCKSECRET';
  }
  async verify(_token: string, _options?: any) {
    return { valid: false };
  }
  toURI(_options?: any) {
    return 'otpauth://totp/mock';
  }
}

export class NobleCryptoPlugin {}
export class ScureBase32Plugin {}
