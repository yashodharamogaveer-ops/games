/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PuzzleDefinition, DoorId } from './types.ts';

export class PuzzleManager {
  private static instance: PuzzleManager | null = null;
  private puzzles: Map<string, PuzzleDefinition> = new Map();
  private failedAttempts: Map<string, number> = new Map();

  private constructor() {
    this.generatePuzzles();
  }

  public static getInstance(): PuzzleManager {
    if (!PuzzleManager.instance) {
      PuzzleManager.instance = new PuzzleManager();
    }
    return PuzzleManager.instance;
  }

  /**
   * Generates completely fresh, randomized questions and parameters every time
   */
  public generatePuzzles(seed: number = Math.random()) {
    this.puzzles.clear();
    this.failedAttempts.clear();

    const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());

    // ========================================================
    // 1. BEDROOM DOOR: Dynamic Numerical Progression (6 Archetypes)
    // ========================================================
    const bedroomType = Math.floor(Math.random() * 6);
    let bedQ = '';
    let bedAns = '';
    let bedHint = '';
    let bedDesc = '';

    if (bedroomType === 0) {
      // Doubling sequence
      const base = 2 + Math.floor(Math.random() * 5); // 2, 3, 4, 5, 6
      const s0 = base;
      const s1 = s0 * 2;
      const s2 = s1 * 2;
      const s3 = s2 * 2;
      bedAns = s3.toString();
      bedQ = `${s0}  ➜  ${s1}  ➜  ${s2}  ➜  [ ? ]`;
      bedHint = `Each term doubles the previous: ${s2} × 2 = ${bedAns}`;
      bedDesc = 'Find the missing number in the geometric series. Rule: Multiply by 2 at each step.';
    } else if (bedroomType === 1) {
      // Tripling sequence
      const base = 2 + Math.floor(Math.random() * 3); // 2, 3, 4
      const s0 = base;
      const s1 = s0 * 3;
      const s2 = s1 * 3;
      const s3 = s2 * 3;
      bedAns = s3.toString();
      bedQ = `${s0}  ➜  ${s1}  ➜  ${s2}  ➜  [ ? ]`;
      bedHint = `Each term triples the previous: ${s2} × 3 = ${bedAns}`;
      bedDesc = 'Find the missing number in the sequence. Rule: Multiply by 3 at each step.';
    } else if (bedroomType === 2) {
      // Step addition
      const start = 7 + Math.floor(Math.random() * 15);
      const step = 6 + Math.floor(Math.random() * 8);
      const s0 = start;
      const s1 = s0 + step;
      const s2 = s1 + step;
      const s3 = s2 + step;
      bedAns = s3.toString();
      bedQ = `${s0}  ➜  ${s1}  ➜  ${s2}  ➜  [ ? ]`;
      bedHint = `Constant increment of +${step}: ${s2} + ${step} = ${bedAns}`;
      bedDesc = `Find the next number in the arithmetic progression (+${step} each step).`;
    } else if (bedroomType === 3) {
      // Square numbers
      const bases = randChoice([
        [2, 3, 4, 5],
        [3, 4, 5, 6],
        [4, 5, 6, 7],
        [5, 6, 7, 8],
      ]);
      const s0 = bases[0] * bases[0];
      const s1 = bases[1] * bases[1];
      const s2 = bases[2] * bases[2];
      const s3 = bases[3] * bases[3];
      bedAns = s3.toString();
      bedQ = `${s0}  ➜  ${s1}  ➜  ${s2}  ➜  [ ? ]`;
      bedHint = `Square sequence: ${bases[3]}² = ${bases[3]} × ${bases[3]} = ${bedAns}`;
      bedDesc = `Identify the square progression (${bases[0]}², ${bases[1]}², ${bases[2]}², ${bases[3]}²).`;
    } else if (bedroomType === 4) {
      // Fibonacci pattern
      const f0 = 3 + Math.floor(Math.random() * 3);
      const f1 = f0 + 1;
      const f2 = f0 + f1;
      const f3 = f1 + f2;
      const f4 = f2 + f3;
      bedAns = f4.toString();
      bedQ = `${f0}  ➜  ${f1}  ➜  ${f2}  ➜  ${f3}  ➜  [ ? ]`;
      bedHint = `Sum of the two previous terms: ${f2} + ${f3} = ${bedAns}`;
      bedDesc = 'Fibonacci sum rule: Each term is the sum of the preceding two values.';
    } else {
      // Alternating step sequence (+8, -3, +8, -3)
      const base = 10 + Math.floor(Math.random() * 10);
      const s0 = base;
      const s1 = s0 + 8;
      const s2 = s1 - 3;
      const s3 = s2 + 8;
      const s4 = s3 - 3;
      bedAns = s4.toString();
      bedQ = `${s0}  ➜  ${s1}  ➜  ${s2}  ➜  ${s3}  ➜  [ ? ]`;
      bedHint = `Alternating pattern (+8 then -3): ${s3} - 3 = ${bedAns}`;
      bedDesc = 'Alternating progression: Add 8, subtract 3, repeat.';
    }

    const bedOptions = shuffle([
      bedAns,
      (parseInt(bedAns) + 4).toString(),
      (parseInt(bedAns) - 3).toString(),
      (parseInt(bedAns) + 9).toString(),
    ]);

    this.registerPuzzle({
      id: 'puzzle_bedroom',
      doorId: 'door_bedroom',
      type: 'arithmetic_sequence',
      title: 'BEDROOM EXIT OVERRIDE KEYPAD',
      description: bedDesc,
      question: bedQ,
      options: bedOptions,
      correctAnswer: bedAns,
      hint: bedHint,
      isSolved: false,
      category: 'Mathematical Progression',
    });

    // ========================================================
    // 2. DOOR A: Randomized Cybersecurity Logic Riddles (8 Varieties)
    // ========================================================
    const riddlesPool = [
      {
        q: 'Which standard network port is encrypted by default using SSL/TLS for secure web browsing?',
        ans: '443',
        opts: ['80', '443', '22', '21'],
        hint: 'Port 80 is HTTP (plaintext); HTTPS uses port 443.',
        desc: 'Security Port Identification',
      },
      {
        q: 'Which cryptographic algorithm is asymmetric and relies on a public-private key pair?',
        ans: 'RSA',
        opts: ['AES-256', 'RSA', 'SHA-256', 'DES'],
        hint: 'RSA is asymmetric public-key cryptography; AES is symmetric.',
        desc: 'Cryptographic Protocol',
      },
      {
        q: 'What type of cyber attack floods a web server with fake traffic from multiple zombie systems?',
        ans: 'DDoS',
        opts: ['Phishing', 'DDoS', 'SQL Injection', 'Keylogger'],
        hint: 'Distributed Denial of Service (DDoS) overloads servers with coordinated botnet traffic.',
        desc: 'Cyber Attack Classification',
      },
      {
        q: 'Which cryptographic function is one-way and cannot be decrypted back to plaintext?',
        ans: 'SHA-256 HASH',
        opts: ['AES Cipher', 'RSA Key', 'SHA-256 HASH', 'Base64'],
        hint: 'Hashing is irreversible and generates a fixed-length digest.',
        desc: 'Data Integrity & Hashing',
      },
      {
        q: 'Which security layer requires a password PLUS a physical authenticator token or phone prompt?',
        ans: '2FA / MFA',
        opts: ['CAPTCHA', '2FA / MFA', 'Firewall Rule', 'DNSSEC'],
        hint: 'Multi-Factor Authentication (MFA) requires two distinct credential factors.',
        desc: 'Access Control Protocols',
      },
      {
        q: 'What is the default port used by SSH for encrypted terminal administration?',
        ans: '22',
        opts: ['22', '23', '25', '53'],
        hint: 'Telnet was port 23; Secure Shell (SSH) standard port is 22.',
        desc: 'Secure Remote Administration',
      },
      {
        q: 'In the CIA Triad of Information Security, what do the letters stand for?',
        ans: 'Confidentiality, Integrity, Availability',
        opts: [
          'Confidentiality, Integrity, Availability',
          'Cyber, Internet, Authentication',
          'Control, Identification, Access',
          'Crypto, Isolation, Authorization',
        ],
        hint: 'The core security pillars: Confidentiality, Integrity, and Availability.',
        desc: 'Security Architecture Foundations',
      },
      {
        q: 'What defense mechanism prevents malicious SQL commands from altering database queries?',
        ans: 'Parameterized Queries',
        opts: ['Parameterized Queries', 'Port Forwarding', 'CSS Media Queries', 'Data Compression'],
        hint: 'Prepared statements / parameterized queries separate SQL code from user inputs.',
        desc: 'Application Security Hardening',
      },
    ];

    const chosenRiddle = randChoice(riddlesPool);
    this.registerPuzzle({
      id: 'puzzle_door_a',
      doorId: 'door_a',
      type: 'cyber_riddle',
      title: 'DOOR A: SECURITY PROTOCOL KEYPAD',
      description: chosenRiddle.desc,
      question: chosenRiddle.q,
      options: shuffle(chosenRiddle.opts),
      correctAnswer: chosenRiddle.ans,
      hint: chosenRiddle.hint,
      isSolved: false,
      category: 'Cybersecurity Logic',
    });

    // ========================================================
    // 3. DOOR B: Dynamic Binary-to-Decimal Converter
    // ========================================================
    const binaryValues = [
      { bin: '00001010', dec: 10, hint: '8 + 2 = 10' },
      { bin: '00001100', dec: 12, hint: '8 + 4 = 12' },
      { bin: '00001101', dec: 13, hint: '8 + 4 + 1 = 13' },
      { bin: '00001111', dec: 15, hint: '8 + 4 + 2 + 1 = 15' },
      { bin: '00010000', dec: 16, hint: '16 = 16' },
      { bin: '00010010', dec: 18, hint: '16 + 2 = 18' },
      { bin: '00010101', dec: 21, hint: '16 + 4 + 1 = 21' },
      { bin: '00011000', dec: 24, hint: '16 + 8 = 24' },
      { bin: '00011011', dec: 27, hint: '16 + 8 + 2 + 1 = 27' },
      { bin: '00100000', dec: 32, hint: '32 = 32' },
    ];
    const chosenBin = randChoice(binaryValues);
    const binAns = chosenBin.dec.toString();
    const binOpts = shuffle([
      binAns,
      (chosenBin.dec + 2).toString(),
      (chosenBin.dec - 3).toString(),
      (chosenBin.dec + 6).toString(),
    ]);

    this.registerPuzzle({
      id: 'puzzle_door_b',
      doorId: 'door_b',
      type: 'binary_conversion',
      title: 'DOOR B: BINARY CONVERSION TERMINAL',
      description: 'Convert the 8-bit binary register byte into its decimal integer value.',
      question: `BINARY REGISTER BYTE:\n[ 0b${chosenBin.bin} ]\n\nCalculate the decimal value (Base-10):`,
      options: binOpts,
      correctAnswer: binAns,
      hint: `Sum the active powers of two: ${chosenBin.hint}`,
      isSolved: false,
      category: 'Binary Systems',
    });

    // ========================================================
    // 4. DOOR C: Dynamic Boolean Logic Gates (AND, OR, XOR, NOT)
    // ========================================================
    const logicChallenges = [
      {
        q: 'EVALUATE BOOLEAN LOGIC:\nOutput = (1 AND 0) OR (1 AND 1)\n\nWhat is the binary output state?',
        ans: '1',
        opts: ['0', '1', 'NULL', 'UNDEFINED'],
        hint: '(1 AND 0) = 0; (1 AND 1) = 1; (0 OR 1) = 1.',
      },
      {
        q: 'EVALUATE BOOLEAN LOGIC:\nOutput = NOT(1 XOR 0) AND 1\n\nWhat is the binary output state?',
        ans: '0',
        opts: ['0', '1', 'NULL', 'HIGH-Z'],
        hint: '(1 XOR 0) = 1; NOT(1) = 0; (0 AND 1) = 0.',
      },
      {
        q: 'EVALUATE BOOLEAN LOGIC:\nOutput = (0 OR 0) OR NOT(0)\n\nWhat is the binary output state?',
        ans: '1',
        opts: ['0', '1', 'FLOATING', 'OVERFLOW'],
        hint: '(0 OR 0) = 0; NOT(0) = 1; (0 OR 1) = 1.',
      },
      {
        q: 'EVALUATE BOOLEAN LOGIC:\nOutput = (1 XOR 1) OR (0 AND 1)\n\nWhat is the binary output state?',
        ans: '0',
        opts: ['0', '1', 'INFINITY', 'ERROR'],
        hint: 'XOR outputs 0 when inputs match: (1 XOR 1) = 0; (0 AND 1) = 0; (0 OR 0) = 0.',
      },
      {
        q: 'EVALUATE BOOLEAN LOGIC:\nOutput = NOT(0 AND 1) AND NOT(0)\n\nWhat is the binary output state?',
        ans: '1',
        opts: ['0', '1', 'IMPEDANCE', 'UNKNOWN'],
        hint: '(0 AND 1) = 0; NOT(0) = 1; (1 AND 1) = 1.',
      },
    ];

    const chosenLogic = randChoice(logicChallenges);
    this.registerPuzzle({
      id: 'puzzle_door_c',
      doorId: 'door_c',
      type: 'logic_gates',
      title: 'DOOR C: DIGITAL LOGIC GATE TERMINAL',
      description: 'Calculate the boolean truth state of the logic circuit.',
      question: chosenLogic.q,
      options: chosenLogic.opts,
      correctAnswer: chosenLogic.ans,
      hint: chosenLogic.hint,
      isSolved: false,
      category: 'Boolean Circuitry',
    });

    // ========================================================
    // 5. SERVER TERMINAL: Dynamic Hex Register Key
    // ========================================================
    const hexCodes = ['4A9F', '7B2C', '9E1D', '3F8A', '8C4E', '5D7B'];
    const chosenHex = randChoice(hexCodes);
    this.registerPuzzle({
      id: 'puzzle_server_terminal',
      type: 'cyber_riddle',
      title: 'MAINFRAME CORE REGISTER OVERRIDE',
      description: 'The root mainframe has generated a master encryption seed.',
      question: `ENCRYPTION KEYSTREAM DETECTED:\nROOT SEED: 0x${chosenHex}\n\nType or select the root hex register code to unlock the master airlock passkey:`,
      options: shuffle([chosenHex, '3B81', '7F90', '9A4D']),
      correctAnswer: chosenHex,
      hint: `The hex register is explicitly displayed above: ${chosenHex}`,
      isSolved: false,
      category: 'Cryptographic Registers',
    });

    // ========================================================
    // 6. DOOR F: MASTER AIRLOCK (Door F)
    // ========================================================
    const airlockPass = `GATE-${chosenHex}`;
    this.registerPuzzle({
      id: 'puzzle_door_f',
      doorId: 'door_f',
      type: 'cyber_riddle',
      title: 'DOOR F: MASTER AIRLOCK PASSKEY',
      description: 'Requires the master airlock prefix combined with the Server Mainframe hex code.',
      question: `MASTER AIRLOCK CONSOLE\nFormat: GATE-[SERVER_HEX_SEED]\n\nEnter the full authorized passkey:`,
      options: shuffle([
        airlockPass,
        `GATE-3B81`,
        `GATE-7F90`,
        `GATE-9A4D`,
      ]),
      correctAnswer: airlockPass,
      hint: `Combine "GATE-" with the code from the Server Room terminal (${chosenHex}): ${airlockPass}`,
      isSolved: false,
      category: 'Master Access Airlock',
    });

    // ========================================================
    // 7. EXIT GATE TERMINAL: Perimeter Voltage Frequency Calculation
    // ========================================================
    const baseFreq = 40 + Math.floor(Math.random() * 20); // e.g. 48 MHz
    const multiplier = 3;
    const exitAns = (baseFreq * multiplier).toString();
    this.registerPuzzle({
      id: 'puzzle_exit_gate',
      doorId: 'door_exit',
      type: 'arithmetic_sequence',
      title: 'PERIMETER LASER GATE OVERRIDE TERMINAL',
      description: 'Align the perimeter harmonic resonance frequency to safely neutralize the laser barrier.',
      question: `GATE LASER EMITTER FREQUENCY:\nBase Oscillation: ${baseFreq} MHz\nNeutralization Harmonic: 3rd Harmonic (× 3)\n\nCalculate the target neutralizing frequency in MHz:`,
      options: shuffle([
        exitAns,
        (parseInt(exitAns) + 12).toString(),
        (parseInt(exitAns) - 15).toString(),
        (parseInt(exitAns) + 24).toString(),
      ]),
      correctAnswer: exitAns,
      hint: `Multiply base frequency by 3: ${baseFreq} × 3 = ${exitAns} MHz`,
      isSolved: false,
      category: 'Harmonic Alignment',
    });
  }

  public registerPuzzle(puzzle: PuzzleDefinition) {
    this.puzzles.set(puzzle.id, puzzle);
  }

  public getPuzzle(id: string): PuzzleDefinition | undefined {
    return this.puzzles.get(id);
  }

  public getPuzzleForDoor(doorId: DoorId): PuzzleDefinition | undefined {
    for (const p of this.puzzles.values()) {
      if (p.doorId === doorId) return p;
    }
    return undefined;
  }

  /**
   * 2-ATTEMPT STRIKE RULE FOR PUZZLES:
   * Attempt 1: Informs player, unlocks hint, DOES NOT alert the hacker!
   * Attempt 2: 2nd consecutive failure alerts the hacker and dispatches him!
   */
  public validateAnswer(
    id: string,
    answer: string
  ): { isCorrect: boolean; hint?: string; message: string; alertTriggered: boolean } {
    const puzzle = this.puzzles.get(id);
    if (!puzzle) {
      return { isCorrect: false, alertTriggered: false, message: 'Puzzle not found' };
    }

    const cleanedGiven = answer.trim().toUpperCase();
    const cleanedExpected = puzzle.correctAnswer.trim().toUpperCase();

    if (cleanedGiven === cleanedExpected) {
      puzzle.isSolved = true;
      this.failedAttempts.delete(id);
      return {
        isCorrect: true,
        alertTriggered: false,
        message: 'AUTHENTICATION VERIFIED // ACCESS GRANTED',
      };
    }

    const currentFails = (this.failedAttempts.get(id) || 0) + 1;
    this.failedAttempts.set(id, currentFails);

    if (currentFails === 1) {
      // 1st attempt: Clear, helpful hint, no alarm sent
      return {
        isCorrect: false,
        hint: puzzle.hint,
        alertTriggered: false,
        message: 'INCORRECT (ATTEMPT 1/2) - HINT UNLOCKED BELOW! RETRY ONCE MORE WITHOUT PENALTY',
      };
    } else {
      // 2nd attempt: Alarm triggered!
      return {
        isCorrect: false,
        hint: puzzle.hint,
        alertTriggered: true,
        message: 'SECURITY INTRUSION ALARM (2/2 ATTEMPTS FAILED)! HACKER DISPATCHED TO YOUR ROOM!',
      };
    }
  }

  public getFailedAttempts(id: string): number {
    return this.failedAttempts.get(id) || 0;
  }
}
