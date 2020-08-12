import * as core from '@actions/core'
import {graphql} from '@octokit/graphql'
import * as _ from 'lodash'
import * as semver from 'semver'

async function run(): Promise<void> {
  try {
    const organisation: string = core.getInput('github_owner', {required: true})
    const repoName: string = core.getInput('image_name', {required: true})
    const token: string = core.getInput('github_token', {required: true})
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })

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
    console.log(JSON.stringify(organization))
    console.log(JSON.stringify(organization.packages))
    console.log(JSON.stringify(organization.packages.nodes))
    console.log(JSON.stringify(organization.packages.nodes.versions))
    console.log(JSON.stringify(organization.packages.nodes.versions.nodes))
    console.log(
      JSON.stringify(organization.packages.nodes.versions.nodes.version)
    )
    const versions =
      organization?.packages?.nodes?.versions?.nodes?.version ?? '0.0.1'
    const latest = _.first(
      _.remove(versions, function(e) {
        return semver.validRange(e as string)
      })
    )

    core.setOutput('latest', latest)
    core.exportVariable('latest', latest)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
