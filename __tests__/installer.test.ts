import io = require('@actions/io');
import fs = require('fs');
import path = require('path');
import child_process = require('child_process');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const javaDir = path.join(__dirname, 'runner', 'java');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 300000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Throws if invalid directory to jdk', async () => {
    let thrown = false;
    try {
      await installer.getJava('1000', 'x64', 'bad path', 'jdk');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Downloads java if no file given', async () => {
    await installer.getJava('8.0.252', 'x64', '', 'jdk');
    const JavaDir = path.join(toolDir, 'jdk', '8.0.252', 'x64');

    expect(fs.existsSync(`${JavaDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(JavaDir, 'bin'))).toBe(true);
  }, 100000);

  it('Downloads java with 1.x syntax', async () => {
    await installer.getJava('1.11', 'x64', '', 'jdk');
    const JavaDir = path.join(toolDir, 'jdk', '11.0.7', 'x64');

    expect(fs.existsSync(`${JavaDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(JavaDir, 'bin'))).toBe(true);
  }, 100000);

  it('Downloads java with normal semver syntax', async () => {
    await installer.getJava('11.0.x', 'x64', '', 'jdk');
    const JavaDir = path.join(toolDir, 'jdk', '11.0.7', 'x64');

    expect(fs.existsSync(`${JavaDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(JavaDir, 'bin'))).toBe(true);
  }, 100000);

  it('Downloads java if package is jre', async () => {
    await installer.getJava('8.0.252', 'x64', '', 'jre');
    const JavaDir = path.join(toolDir, 'jre', '8.0.252', 'x64');

    expect(fs.existsSync(`${JavaDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(JavaDir, 'bin'))).toBe(true);
  }, 100000);

  it('Throws if invalid java package is specified', async () => {
    let thrown = false;
    try {
      await installer.getJava('8.0.252', 'x64', '', 'bad jdk');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Throws if invalid directory to jdk', async () => {
    let thrown = false;
    try {
      await installer.getJava('1000', 'x64', 'bad path', 'jdk');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of Java installed in cache', async () => {
    const JavaDir: string = path.join(toolDir, 'jdk', '250.0.0', 'x64');
    await io.mkdirP(JavaDir);
    fs.writeFileSync(`${JavaDir}.complete`, 'hello');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getJava(
      '250',
      'x64',
      'path shouldnt matter, found in cache',
      'jdk'
    );
    return;
  });

  it('Doesnt use version of Java that was only partially installed in cache', async () => {
    const JavaDir: string = path.join(toolDir, 'jdk', '251.0.0', 'x64');
    await io.mkdirP(JavaDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getJava('251', 'x64', 'bad path', 'jdk');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
