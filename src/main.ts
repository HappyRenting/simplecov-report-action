import * as path from 'path'
import * as fs from 'fs'
import * as core from '@actions/core'
import {report} from './report'

function parseFile(filePath: string) {
  const content = fs.readFileSync(path.resolve(process.env.GITHUB_WORKSPACE!, filePath))

  return JSON.parse(content.toString())
}

async function run(): Promise<void> {
  try {
    const failedThreshold: number = Number.parseInt(core.getInput('failedThreshold'), 10)
    core.debug(`failedThreshold ${failedThreshold}`)

    const resultPath: string = core.getInput('resultPath')
    core.debug(`resultPath ${resultPath}`)

    const json = parseFile(resultPath)
    const coveredPercent = json.result.covered_percent ?? json.result.line

    if (coveredPercent === undefined) {
      throw new Error('Coverage is undefined!')
    }

    await report(coveredPercent, failedThreshold)

    if (coveredPercent < failedThreshold) {
      throw new Error(`Coverage is less than ${failedThreshold}%. (${coveredPercent}%)`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
