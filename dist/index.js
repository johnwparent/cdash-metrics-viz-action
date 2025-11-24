import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getInput, setOutput, info, summary, setFailed } from '@actions/core';

/**
 * Given a CMake build directory, either as an absolute or relative path,
 * locate a testing directory for a CDash upload, and extract the buildId
 * from the Done.xml file.
 * 
 * @param {string} baseDirName - The name of the initial directory to check.
 * @returns {string | null} The extracted build ID, or null if any step fails.
 */
function getBuildIdFromDirectory(baseDirName) {
  let rootPath;
  if (path.isAbsolute(baseDirName)) {
    rootPath = baseDirName;
  }
  else {
    rootPath = join(process.cwd(), baseDirName);
  }
    info(`Checking root path: ${rootPath}`);

    if (!existsSync(rootPath)) {
      throw new Error(`Provided build directory not found: ${rootPath}`);
    }

    const testDir = path.join(rootPath, "Testing");
    const entries = readdirSync(testDir, { withFileTypes: true });

    const subDirs = entries.filter(entry => entry.isDirectory());

    if (subDirs.length === 0) {
      throw new Error(`Testing directory ${testDir} does not contain enough context to find a build dashboard`);
    }

    if (subDirs.length > 1) {
      throw new Error(`Multiple test subdirectories found. Expected exactly one. Found: ${subDirs.map(d => d.name).join(', ')}`);
    }

    const onlySubDirName = subDirs[0].name;
    info(`Found single subdirectory: ${onlySubDirName}`);

    const subDirPath = join(testDir, onlySubDirName);

    const xmlFileName = 'Done.xml';
    const xmlFilePath = join(subDirPath, xmlFileName);

    if (!existsSync(xmlFilePath)) {
      throw new Error(`CTest CDash upload confirmation file not found at: ${xmlFilePath}`);
    }

    info(`Reading Dashboard upload file: ${xmlFilePath}`);

    const xmlContent = readFileSync(xmlFilePath, 'utf8');

    const buildIdRegex = /<buildId>(\d+)<\/buildId>/;
    const match = xmlContent.match(buildIdRegex);

    if (match && match[1]) {
      const buildId = match[1];
      info(`Extracted Build ID: ${buildId}`);
      return buildId;
    } else {
      throw new Error(`No buildId present in CDash done file.`);
    }
}

function run() {
    try {

      const directoryToProcess = getInput('build-directory', { required: true });
      const cdashEndpoint = getInput('cdash', { required: true });

      const extractedId = getBuildIdFromDirectory(directoryToProcess);
      const visUrl = `https://corsa.center/dashboard/explore/project-metrics/metrics/index.html?bid=${buildId}&cdash=${cdashEndpoint}`;
      if (extractedId) {
        setOutput('url', visUrl);
        info(`Successfully set output 'url' to: ${visUrl}`);
        summary.addLink('View build metrics', visUrl);
      } else {
        // Worst case
        setFailed('Extraction failed for unknown reason.');
      }

    } catch (error) {
        setFailed(error.message);
    }
}

run();
//# sourceMappingURL=index.js.map
