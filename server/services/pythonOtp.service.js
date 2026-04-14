import { spawn } from 'node:child_process';
import path from 'node:path';

const PYTHON_COMMAND = process.env.PYTHON_BIN || 'python';
const SCRIPT_PATH = path.resolve(process.cwd(), 'services', 'phone_otp.py');

export const generateOtpCode = () =>
  new Promise((resolve, reject) => {
    const child = spawn(PYTHON_COMMAND, [SCRIPT_PATH, 'generate', '6'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`Unable to start Python OTP generator: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Python OTP generator exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (!parsed.otp) {
          throw new Error('Python OTP generator returned an empty code');
        }
        resolve(parsed.otp);
      } catch (error) {
        reject(new Error(`Unable to parse Python OTP response: ${error.message}`));
      }
    });
  });
