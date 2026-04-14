import json
import secrets
import sys

try:
    import pyotp
except ImportError:  # pragma: no cover - runtime fallback
    pyotp = None


def generate_code(digits: int = 6) -> str:
    if pyotp is not None:
        secret = pyotp.random_base32()
        return pyotp.TOTP(secret, digits=digits, interval=300).now()
    upper_bound = 10 ** digits
    return f"{secrets.randbelow(upper_bound):0{digits}d}"


def main() -> int:
    command = sys.argv[1] if len(sys.argv) > 1 else "generate"
    digits = int(sys.argv[2]) if len(sys.argv) > 2 else 6

    if command != "generate":
        print(json.dumps({"error": f"Unsupported command: {command}"}))
        return 1

    print(json.dumps({"otp": generate_code(digits)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
