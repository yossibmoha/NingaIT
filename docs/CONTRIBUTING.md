# Contributing to NinjaIT

First off, thank you for considering contributing to NinjaIT! It's people like you that make NinjaIT such a great tool.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How Can I Contribute?](#how-can-i-contribute)
4. [Development Process](#development-process)
5. [Style Guidelines](#style-guidelines)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@ninjait.io.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Read the [README.md](../README.md)
2. Set up your [development environment](DEVELOPMENT.md)
3. Familiarized yourself with the [architecture](ARCHITECTURE.md)
4. Joined our [Discord community](https://discord.gg/ninjait)

### Finding an Issue to Work On

1. **Good First Issues**: Look for issues labeled [`good first issue`](https://github.com/yossibmoha/NingaIT/labels/good%20first%20issue)
2. **Help Wanted**: Check issues labeled [`help wanted`](https://github.com/yossibmoha/NingaIT/labels/help%20wanted)
3. **Your Own Ideas**: Have an idea? Create an issue first to discuss it!

### Communication

- **Discord**: Join our [Discord server](https://discord.gg/ninjait) for real-time chat
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussions
- **Email**: For private concerns, email team@ninjait.io

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When creating a bug report, include:**

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Screenshots** if applicable
- **Environment details**:
  - OS (Windows, macOS, Linux)
  - Browser (if web-related)
  - NinjaIT version
  - Node.js version

**Example Bug Report:**

```markdown
### Bug: Device monitoring stops after 24 hours

**Description:**
Device monitoring stops collecting metrics after approximately 24 hours of operation.

**Steps to Reproduce:**
1. Install agent on Windows 10 device
2. Monitor device metrics for 24+ hours
3. Observe metrics stop updating

**Expected Behavior:**
Metrics should continue updating indefinitely.

**Actual Behavior:**
Metrics stop after ~24 hours. Agent must be restarted to resume.

**Environment:**
- OS: Windows 10 Pro (Build 19044)
- Agent Version: 0.1.2
- Backend Version: 0.1.5
- Node.js: 18.16.0

**Screenshots:**
[Attach screenshots showing the issue]

**Additional Context:**
This issue started after upgrading to agent version 0.1.2.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**

- **Clear title and description**
- **Use case**: Why is this enhancement useful?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Mockups/wireframes** if applicable

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** from `develop`
3. **Make your changes**
4. **Write tests** for your changes
5. **Ensure all tests pass**
6. **Submit a pull request**

### Contributing Documentation

Documentation improvements are always welcome!

- Fix typos and grammatical errors
- Improve clarity and readability
- Add examples and tutorials
- Translate documentation
- Create video tutorials

### Contributing Designs

UI/UX designers can contribute by:

- Creating mockups for new features
- Improving existing designs
- Creating icons and graphics
- Conducting usability tests
- Providing design feedback

---

## Development Process

### 1. Set Up Your Development Environment

Follow the [Development Guide](docs/DEVELOPMENT.md) to set up your local environment.

### 2. Create a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/add-device-monitoring` - New features
- `bugfix/fix-alert-routing` - Bug fixes
- `docs/update-api-docs` - Documentation
- `refactor/improve-auth-service` - Code refactoring
- `test/add-device-tests` - Tests

### 3. Make Your Changes

- Write clean, readable code
- Follow our [coding standards](docs/DEVELOPMENT.md#coding-standards)
- Add comments for complex logic
- Keep commits focused and atomic

### 4. Write Tests

- Add unit tests for new functionality
- Update existing tests if modifying code
- Ensure test coverage remains above 80%
- Test edge cases and error conditions

```bash
# Run tests
npm test

# Check coverage
npm run test:coverage
```

### 5. Run Linters

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check TypeScript types
npm run type-check
```

### 6. Update Documentation

- Update relevant documentation files
- Add JSDoc comments to functions
- Update API documentation if needed
- Add examples for new features

### 7. Commit Your Changes

Follow our [commit message guidelines](#commit-guidelines).

```bash
git add .
git commit -m "feat(devices): add real-time monitoring"
```

### 8. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 9. Create a Pull Request

See [Pull Request Process](#pull-request-process) below.

---

## Style Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Use **ESLint** and **Prettier** for code formatting
- Follow **Airbnb Style Guide** with our modifications
- Use **functional programming** patterns where appropriate
- Avoid `any` type; use proper typing

```typescript
// Good ✅
interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

async function getDevice(id: string): Promise<Device> {
  const device = await db.device.findUnique({ where: { id } });
  if (!device) {
    throw new Error('Device not found');
  }
  return device;
}

// Bad ❌
function getDevice(id: any) {
  return db.device.findUnique({ where: { id } });
}
```

### React/JSX

- Use **functional components** with hooks
- Use **TypeScript** for all components
- Keep components small and focused
- Use **custom hooks** for reusable logic
- Avoid inline styles; use CSS modules or styled-components

```tsx
// Good ✅
import React, { useState } from 'react';
import styles from './DeviceCard.module.css';

interface DeviceCardProps {
  device: Device;
  onSelect: (id: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(device.id)}
    >
      <h3>{device.name}</h3>
      <span className={styles.status}>{device.status}</span>
    </div>
  );
};
```

### CSS/Styling

- Use **CSS Modules** or **Tailwind CSS**
- Follow **BEM naming** convention if using plain CSS
- Keep styles modular and reusable
- Use CSS variables for theming

### Testing

- Write **descriptive test names**
- Use **AAA pattern**: Arrange, Act, Assert
- Mock external dependencies
- Test both success and error cases

```typescript
describe('DeviceService', () => {
  describe('getDeviceById', () => {
    it('should return device when found', async () => {
      // Arrange
      const deviceId = '123';
      const mockDevice = { id: deviceId, name: 'Test Device' };
      jest.spyOn(db.device, 'findUnique').mockResolvedValue(mockDevice);

      // Act
      const result = await deviceService.getDeviceById(deviceId);

      // Assert
      expect(result).toEqual(mockDevice);
    });
  });
});
```

---

## Commit Guidelines

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, white-space)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration

### Scope

The scope should be the name of the module affected:

- `devices`
- `alerts`
- `tickets`
- `auth`
- `monitoring`
- `api`

### Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period at the end
- Maximum 72 characters

### Examples

```bash
feat(devices): add real-time CPU monitoring

Implemented WebSocket connection for live CPU metrics.
Added chart component to display historical data.

Closes #123

fix(auth): prevent token expiration race condition

Added mutex to token refresh logic to prevent multiple
concurrent refresh attempts that could cause authentication
errors.

Fixes #456

docs(api): update device endpoints documentation

Added examples for all device-related API endpoints.
Updated request/response schemas.

test(alerts): increase test coverage for alert service

Added tests for:
- Alert creation with invalid data
- Alert routing logic
- Notification delivery failures

Coverage increased from 65% to 82%.

perf(monitoring): optimize metric collection query

Replaced N+1 query with single batched query.
Reduced API response time from 450ms to 80ms.

Closes #789
```

---

## Pull Request Process

### Before Submitting

- [ ] Branch is up to date with `develop`
- [ ] All tests pass locally
- [ ] Linting passes with no errors
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines

### Creating a Pull Request

1. **Fill out the PR template completely**
2. **Link related issues** (Closes #123)
3. **Add labels** (feature, bugfix, docs, etc.)
4. **Request reviewers** (suggest 2-3 team members)
5. **Ensure CI checks pass**

### PR Title Format

Use the same format as commit messages:

```
feat(devices): add real-time monitoring
fix(auth): prevent token expiration race condition
docs(api): update device endpoints
```

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe how you tested your changes:
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots showing the changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added that prove fix is effective
- [ ] All tests pass locally
```

### Code Review Process

1. **Reviewer assignment**: Maintainers will review within 48 hours
2. **Feedback**: Address all comments and questions
3. **Re-review**: Request re-review after making changes
4. **Approval**: Requires at least 1 approval from maintainer
5. **Merge**: Maintainer will merge after approval

### Addressing Review Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: address PR feedback"
git push origin feature/your-feature-name
```

### After Merge

- Delete your feature branch (both local and remote)
- Update your local `develop` branch
- Start your next contribution!

---

## Community

### Where to Get Help

- **Discord**: [Join our server](https://discord.gg/ninjait)
  - `#general` - General discussion
  - `#dev-help` - Development questions
  - `#feature-requests` - Feature ideas
  - `#bug-reports` - Bug reporting

- **GitHub Discussions**: For longer-form discussions
- **Stack Overflow**: Tag questions with `ninjait`
- **Email**: team@ninjait.io

### Recognition

Contributors will be recognized in:

- **README.md** - All contributors section
- **CHANGELOG.md** - Release notes
- **Social Media** - Feature highlights
- **Annual Report** - Top contributors

### Contributor Levels

As you contribute more, you can progress through levels:

1. **Contributor**: Made your first contribution
2. **Regular Contributor**: 5+ merged PRs
3. **Core Contributor**: 20+ merged PRs, helps with code reviews
4. **Maintainer**: Trusted with merge access and release management

---

## License

By contributing to NinjaIT, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

## Questions?

Don't hesitate to ask questions! We're here to help:

- **Discord**: [discord.gg/ninjait](https://discord.gg/ninjait)
- **Email**: team@ninjait.io
- **GitHub Discussions**: [Ask a question](https://github.com/yossibmoha/NingaIT/discussions)

---

**Thank you for contributing to NinjaIT! 🚀**

