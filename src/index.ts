import { KeyEncodings } from '@otplib/core'
import { exec } from 'child_process'
import * as osascript from 'node-osascript'
import { totp } from 'otplib'

// Get command line arguments
const args = process.argv.slice(2)

// Assign command line arguments to constants
const remoteUser = args[0]
const remoteHost = args[1]
const remoteSecretFilePath = args[2]

// Ensure that required arguments are provided
if (!remoteUser || !remoteHost || !remoteSecretFilePath) {
  console.error(
    'Usage: ts-node index.ts <remote-user> <remote-host> <remote-secret-file-path>',
  )
  process.exit(1)
}

// Function to fetch the secret from a remote computer via SSH
function fetchSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
    // SSH command to fetch the secret
    const sshCommand = `ssh ${remoteUser}@${remoteHost} cat ${remoteSecretFilePath}`

    // Execute SSH command
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error fetching secret: ${error.message}`))
        return
      }
      if (stderr) {
        reject(new Error(`SSH command error: ${stderr}`))
        return
      }
      // Resolve with the fetched secret
      resolve(stdout.trim())
    })
  })
}

// Function to generate a TOTP token using the fetched secret
async function generateToken() {
  try {
    // Fetch the secret
    const hexSecret = await fetchSecret()

    // Set TOTP options encoding to 'hex'
    totp.options = { encoding: KeyEncodings.HEX }

    // Generate TOTP token using the fetched secret
    const token = totp.generate(hexSecret)
    console.log('Generated TOTP token:', token)
    return token
  } catch (error: unknown) {
    console.error(error)
    await displayNotification(`Failed to generate token: ${error}`)
  }
}

// Function to paste the generated token into the text field
function pasteTokenIntoSecureAccessClient(token: string) {
  const script = `
  tell application "Ivanti Secure Access"
	activate
	delay 1 -- Add delay if necessary to ensure the application is fully activated
end tell

-- Simulate typing the token directly into the active text field
tell application "System Events"
	keystroke "${token}"
  keystroke return
end tell
    `

  osascript.execute(script, (err, result) => {
    if (err) {
      console.error('Error executing AppleScript:', err)
      displayNotification(`Failed to paste OTP: ${err}`)
    } else {
      console.log('Token pasted successfully')
    }
  })
}

async function displayNotification(message: string) {
  return new Promise<void>((resolve, reject) => {
    const script = `display notification "${message}" with title "AutoIvantiOTP"`
    osascript.execute(script, (err, result) => {
      if (err) {
        console.error('Error executing AppleScript:', err)
        return reject(err)
      }
      resolve()
    })
  })
}

async function main() {
  await displayNotification('Generating OTP...')
  // Call the generateToken function to initiate the process
  const token = await generateToken()
  if (!token) {
    process.exit(1)
  }

  // Call the function to paste the token into the text field
  pasteTokenIntoSecureAccessClient(token)
}
main()
