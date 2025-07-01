# Contributing to Autonomous AI Agent

We love your input! We want to make contributing to Autonomous AI Agent as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. Install dependencies with `npm install`
3. If you've added code that should be tested, add tests
4. If you've changed APIs, update the documentation
5. Ensure the test suite passes
6. Make sure your code follows our TypeScript style guide
7. Issue that pull request!

## Code Style and Standards

### TypeScript Guidelines
- Use TypeScript's strict mode (enabled in tsconfig.json)
- Properly type all variables, parameters, and return values
- Use interfaces for object shapes
- Leverage TypeScript's type system to prevent runtime errors

### Code Quality
- Use ESLint for code linting
- Format code with Prettier
- Maintain comprehensive JSDoc documentation
- Write unit tests using Jest
- Follow async/await patterns for asynchronous code
- Use meaningful variable and function names

### Best Practices
- Follow SOLID principles
- Write modular and reusable code
- Keep functions small and focused
- Use dependency injection where appropriate
- Handle errors properly with try/catch
- Use environment variables for configuration

## Development Setup

1. Install Node.js (v16 or later)
2. Clone the repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and configure
5. Start development server:
   ```bash
   npm run dev
   ```

## Testing

- Write tests using Jest
- Place tests in `__tests__` directories or with `.test.ts` extension
- Run tests with:
  ```bash
  npm test
  ```
- Aim for good test coverage
- Include unit tests for new features
- Add integration tests for API endpoints

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update any relevant documentation
3. Add or update tests as needed
4. Update `package.json` if adding dependencies
5. The PR will be merged once you have the sign-off of at least one maintainer

## Any contributions you make will be under the MIT License
When you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/btb-finance/Autonomous-AI-Agent/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/btb-finance/Autonomous-AI-Agent/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Priority Areas for Contribution

We particularly need help with:
- Enhanced conversation strategies
- Additional social media platform integrations
- Improved security measures
- Testing and documentation
- UI/UX for monitoring and configuration

## Code Review Process

1. All code changes happen through pull requests
2. Pull requests are reviewed by at least one maintainer
3. Reviews focus on:
   - Code quality and style
   - Type safety
   - Test coverage
   - Documentation
   - Security considerations

## Setting Up Development Environment

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your IDE:
   - Enable TypeScript support
   - Install ESLint extension
   - Install Prettier extension
   - Configure auto-formatting on save
4. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
