import {cleanBranchName} from '../src/main'

it('should remove the semver from the branch', () => {
  const clean = cleanBranchName(
    'dependabot/nuget/xunit.runner.visualstudio-2.4.3'
  )
  expect(clean).toBe('dependabot-nuget-xunit-runner-visualstudio')
})

it('should not remove if no semver', () => {
  const clean = cleanBranchName('dependabot/nuget/xunit.runner.visualstudio')
  expect(clean).toBe('dependabot-nuget-xunit-runner-visualstudio')
})
