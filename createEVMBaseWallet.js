#!/usr/bin/env node

/**
 * createEVMBaseWallet.js
 *
 * Creates a new EVM wallet for use on Base Mainnet.
 * Saves the wallet credentials to ~/.openart/wallet.json
 *
 * Usage:
 *   node scripts/createEVMBaseWallet.js
 *
 * Output:
 *   ~/.openart/wallet.json  (owner-only permissions)
 *
 * Dependencies:
 *   - ethers (npm install ethers)  -- for proper address derivation
 *   OR runs standalone with Node.js crypto (address may need re-derivation)
 *
 * IMPORTANT: Keep your private key safe. Anyone with it controls your wallet.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Storage location ────────────────────────────────────────
const OPENART_DIR = path.join(os.homedir(), '.openart');
const WALLET_PATH = path.join(OPENART_DIR, 'wallet.json');

// ── Check if wallet already exists ──────────────────────────
if (fs.existsSync(WALLET_PATH)) {
  const existing = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          WALLET ALREADY EXISTS                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║                                                  ║');
  console.log('║  Address:  ' + existing.address.padEnd(37) + '║');
  console.log('║  File:     ~/.openart/wallet.json                ║');
  console.log('║                                                  ║');
  console.log('║  To create a NEW wallet, first delete:           ║');
  console.log('║    rm ~/.openart/wallet.json                     ║');
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  process.exit(0);
}

// ── Try to use ethers.js for proper key derivation ──────────
let wallet;
try {
  const { ethers } = require('ethers');
  wallet = ethers.Wallet.createRandom();
} catch (e) {
  // ethers not available — try to install it, or use crypto fallback
  console.log('ethers.js not found. Attempting to install...');
  try {
    const { execSync } = require('child_process');
    execSync('npm install ethers --no-save --silent', { stdio: 'pipe' });
    const { ethers } = require('ethers');
    wallet = ethers.Wallet.createRandom();
    console.log('ethers.js installed successfully.\n');
  } catch (e2) {
    // Final fallback: use Node.js crypto
    const crypto = require('crypto');
    const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
    // Without ethers we cannot derive the correct address from the private key.
    // We store the private key and instruct the user to derive the address.
    wallet = {
      address: null,
      privateKey: privateKey,
      _fallback: true,
    };
  }
}

// ── Create the storage directory ────────────────────────────
if (!fs.existsSync(OPENART_DIR)) {
  fs.mkdirSync(OPENART_DIR, { recursive: true, mode: 0o700 });
}

// ── Build wallet data ───────────────────────────────────────
const address = wallet.address;
const privateKey = wallet.privateKey;

const walletData = {
  address: address,
  privateKey: privateKey,
  network: 'Base Mainnet',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  createdAt: new Date().toISOString(),
  note: 'OpenArt NFT Arena wallet. Keep this private key safe!',
};

// ── Save to disk ────────────────────────────────────────────
fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2), { mode: 0o600 });

// ── Print results ───────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║          NEW BASE WALLET CREATED                 ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log('║                                                  ║');

if (address) {
  console.log('║  Address:  ' + address.padEnd(37) + '║');
} else {
  console.log('║  Address:  (install ethers to derive)            ║');
  console.log('║  Run: npm install ethers && node this-script     ║');
}

console.log('║  Network:  Base Mainnet (Chain ID: 8453)         ║');
console.log('║  File:     ~/.openart/wallet.json                ║');
console.log('║                                                  ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log('║  SECURITY                                        ║');
console.log('║  • Private key saved to ~/.openart/wallet.json   ║');
console.log('║  • NEVER share your private key                  ║');
console.log('║  • Back up this file somewhere safe               ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log('║  USE IN OPENART                                  ║');

if (address) {
  console.log('║  agent_wallet: "' + address + '"   ║');
} else {
  console.log('║  agent_wallet: (see wallet.json after ethers)    ║');
}

console.log('║                                                  ║');
console.log('║  To read your wallet:                            ║');
console.log('║    cat ~/.openart/wallet.json                     ║');
console.log('║                                                  ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');
