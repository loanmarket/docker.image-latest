import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import * as _ from 'lodash'
import * as semver from 'semver'

export const cleanBranchName = (branchName: string): string => {
  const replacementName = branchName.replace(/\//g, '-').replace(/\./g, '-')
  const version = semver.coerce(branchName)?.version
  if (version) {
    const regexString = `-?${version}`
    const regex = new RegExp(regexString)
    return replacementName.replace(regex, '')
  }
  return replacementName
}

async function run(): Promise<void> {
  try {
    const organisation: string = core.getInput('github_owner', {required: true})
    const repoName: string = core.getInput('image_name', {required: true})
    const token: string = core.getInput('github_token', {required: true})
    let branch: string = core.getInput('github_head_ref', {required: false})

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })

    branch = cleanBranchName(branch)

    const {organization} = await graphqlWithAuth(
      `query getLatest($organisation: String!, $repoName: String!) {
        organization(login: $organisation) {
          packages(first: 100, names: [$repoName]) {
            nodes {
              id
              name
              versions(first: 100) {
                nodes {
                  version
                }
              }
              latestVersion {
                version
              }
            }
          }
        }
      }`,
      {
        organisation,
        repoName
      }
    )

    const versions: string[] = []

    const nodes = organization?.packages?.nodes[0]?.versions?.nodes

    _.map(nodes, node => {
      versions.push(node.version)
    })

    console.log('versions', versions)
    let latest!: string

    // get latest clean
    const latestClean = _.first(
      _.filter(versions, function(e) {
        return semver.validRange(e) && !e.includes('-')
      })
    ) as string

    // get branch
    if (branch) {
      latest = _.first(
        _.filter(versions, function(e) {
          return semver.validRange(e) && e.includes(branch)
        })
      ) as string

      if (latest == null) {
        latest = latestClean
      }
      latest = semver.inc(latest, 'prerelease', branch) as string
    } else {
      latest = semver.inc(latestClean, 'patch') ?? '0.0.1'
    }

    console.log(latest)

    core.setOutput('latest', latest)
    core.exportVariable('latest', latest)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
