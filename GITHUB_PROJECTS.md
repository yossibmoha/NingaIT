# GitHub Projects - Task Management Guide

This document describes how to use GitHub Projects to manage NinjaIT development.

## Project Board Setup

### Board Structure

We use a **Kanban-style board** with the following columns:

1. **📋 Backlog** - All planned work that hasn't been prioritized
2. **🎯 To Do** - Prioritized tasks ready to be worked on
3. **🚧 In Progress** - Currently being worked on
4. **👀 In Review** - Pull requests under review
5. **✅ Done** - Completed tasks

### Project Views

#### 1. Main Board View
- Default Kanban view
- Shows all tasks across the board
- Filter by label, assignee, milestone

#### 2. Phase View
- Grouped by development phase
- Phases: Foundation, Core RMM, PSA, Advanced, Enterprise, Polish

#### 3. Priority View
- Sorted by priority (Critical, High, Medium, Low)
- Focus on high-priority items first

#### 4. Sprint View
- 2-week sprint cycles
- Track sprint progress and velocity
- Sprint burndown chart

## Issue Labels

### Priority Labels
- `priority: critical` 🔴 - Must be done immediately
- `priority: high` 🟠 - Should be done soon
- `priority: medium` 🟡 - Normal priority
- `priority: low` 🟢 - Nice to have

### Type Labels
- `type: feature` ✨ - New feature
- `type: bug` 🐛 - Bug fix
- `type: enhancement` ⚡ - Improvement to existing feature
- `type: documentation` 📚 - Documentation update
- `type: refactor` 🔧 - Code refactoring
- `type: test` 🧪 - Test-related work

### Component Labels
- `component: backend` - Backend services
- `component: frontend` - Frontend application
- `component: agent` - Agent software
- `component: database` - Database-related
- `component: infrastructure` - DevOps, CI/CD
- `component: security` - Security-related

### Phase Labels
- `phase-1: foundation` - Phase 1 tasks
- `phase-2: core-rmm` - Phase 2 tasks
- `phase-3: psa` - Phase 3 tasks
- `phase-4: advanced` - Phase 4 tasks
- `phase-5: enterprise` - Phase 5 tasks
- `phase-6: polish` - Phase 6 tasks

### Status Labels
- `status: blocked` ⛔ - Blocked by dependency
- `status: needs-discussion` 💬 - Requires team discussion
- `status: good-first-issue` 👋 - Good for new contributors
- `status: help-wanted` 🆘 - External help welcome

## Milestones

### Phase 1 Milestones
- **M1.1**: Infrastructure Setup (Week 4)
- **M1.2**: Authentication System (Week 8)
- **M1.3**: Basic Monitoring (Week 12)
- **M1.4**: Agent MVP (Week 16)
- **M1.5**: Dashboard UI (Week 20)
- **M1.6**: Phase 1 Complete (Week 24)

### Phase 2 Milestones
- **M2.1**: Multi-platform Agents (Month 9)
- **M2.2**: Remote Access (Month 10)
- **M2.3**: Network Discovery (Month 11)
- **M2.4**: Core RMM Complete (Month 12)

## Task Management Workflow

### 1. Creating Tasks

When creating a new issue:

1. **Use issue templates** (Bug Report, Feature Request)
2. **Add clear title** - Use format: `[COMPONENT] Brief description`
3. **Add description** - What, why, and acceptance criteria
4. **Add labels** - Priority, type, component, phase
5. **Assign milestone** - Link to relevant milestone
6. **Estimate effort** - Use story points or hours
7. **Assign to person** - If known

Example:
```
Title: [Backend] Implement device monitoring API endpoint

Description:
Create REST API endpoint for retrieving device monitoring data.

**Requirements:**
- GET /api/v1/devices/:id/metrics
- Support time range filtering
- Return CPU, RAM, disk metrics
- Paginated results

**Acceptance Criteria:**
- [ ] Endpoint implemented
- [ ] Unit tests added
- [ ] API documentation updated
- [ ] Performance tested (< 200ms)

Labels: type: feature, component: backend, priority: high, phase-1: foundation
Milestone: M1.3 - Basic Monitoring
Assignee: @johndoe
```

### 2. Working on Tasks

1. **Move to "In Progress"** when starting work
2. **Create feature branch** - `feature/issue-number-description`
3. **Reference issue in commits** - Use `#123` in commit messages
4. **Update progress** - Comment on issue with updates
5. **Link PR to issue** - Use "Closes #123" in PR description

### 3. Code Review Process

1. **Create Pull Request**
2. **Move to "In Review"** column
3. **Request 1-2 reviewers**
4. **Address feedback** - Make requested changes
5. **Get approval** - At least 1 approval required
6. **Merge PR** - Squash and merge
7. **Move to "Done"** - Automatically done when merged

### 4. Closing Tasks

Tasks are automatically moved to "Done" when:
- PR is merged with "Closes #issue" in description
- Issue is manually closed

## Sprint Planning

### Sprint Cycle (2 weeks)

**Week 1 - Monday**: Sprint Planning
- Review backlog
- Prioritize tasks
- Assign tasks to team members
- Set sprint goals

**Daily**: Standup (async or sync)
- What did I do yesterday?
- What will I do today?
- Any blockers?

**Week 2 - Friday**: Sprint Review & Retrospective
- Demo completed work
- Review sprint metrics
- Discuss what went well
- Identify improvements

### Sprint Metrics

Track these metrics per sprint:
- **Velocity**: Story points completed
- **Burndown**: Tasks remaining over time
- **Cycle Time**: Time from "To Do" to "Done"
- **Throughput**: Number of issues completed
- **Bug Ratio**: Bugs vs features completed

## Automation

### GitHub Actions Integration

Automated workflows:

1. **Auto-label PRs** - Based on file changes
2. **Link issues** - Auto-link PRs to issues
3. **Status updates** - Update project board automatically
4. **Stale issue management** - Close inactive issues
5. **Sprint reports** - Generate sprint reports

### Project Automation Rules

1. **New issues** → Move to "Backlog"
2. **Issue assigned** → Move to "To Do"
3. **PR created** → Move to "In Review"
4. **PR merged** → Move to "Done"
5. **Issue closed** → Move to "Done"

## Best Practices

### For Individual Contributors

1. **Keep tasks small** - Break down large tasks
2. **Update regularly** - Post progress updates
3. **Link everything** - Issues, PRs, commits
4. **Use templates** - Follow issue/PR templates
5. **Ask for help** - Use "blocked" or "help wanted" labels

### For Team Leads

1. **Prioritize ruthlessly** - Focus on high-value work
2. **Balance workload** - Distribute tasks evenly
3. **Remove blockers** - Address blockers quickly
4. **Review metrics** - Track team velocity
5. **Celebrate wins** - Recognize completed milestones

### For Product Managers

1. **Groom backlog** - Keep backlog clean and prioritized
2. **Write clear specs** - Detailed acceptance criteria
3. **Stakeholder updates** - Weekly progress reports
4. **Manage scope** - Prevent scope creep
5. **Plan ahead** - Look 2-3 sprints ahead

## Reports and Dashboards

### Weekly Reports

Generated every Monday:
- Tasks completed last week
- Tasks in progress
- Blockers and risks
- Upcoming milestones

### Monthly Reports

Generated first of each month:
- Phase progress
- Budget tracking
- Team velocity trends
- Key metrics and KPIs

### Executive Dashboard

Real-time dashboard showing:
- Overall project progress
- Phase completion percentages
- Budget vs actual spend
- Team health metrics
- Risk indicators

## Tools and Integrations

### Required Tools
- **GitHub Projects** - Task management
- **GitHub Actions** - Automation
- **Slack** - Team communication
- **Figma** - Design collaboration

### Optional Tools
- **Jira** - If migrating from Jira
- **Linear** - Alternative project management
- **Notion** - Documentation
- **Miro** - Brainstorming and planning

## Tips for Success

### 1. Write Good Issue Descriptions
- Clear title
- Context and background
- Specific requirements
- Acceptance criteria
- Screenshots/mockups if applicable

### 2. Keep Issues Updated
- Comment on progress
- Update status labels
- Link related issues
- Document decisions

### 3. Use Milestones Effectively
- Align with roadmap phases
- Set realistic dates
- Track milestone progress
- Celebrate milestone completion

### 4. Leverage Automation
- Set up GitHub Actions
- Use project automation
- Create templates
- Automate reports

### 5. Communicate Clearly
- Daily standup updates
- Weekly progress reports
- Document decisions
- Share learnings

## Getting Started

### For New Team Members

1. **Get GitHub access** - Request access from team lead
2. **Review project board** - Understand current state
3. **Read documentation** - DEVELOPMENT.md, CONTRIBUTING.md
4. **Pick a "good first issue"** - Start with something small
5. **Ask questions** - Join team Slack channels

### For Existing Team Members

1. **Check your assignments** - Review tasks assigned to you
2. **Update task status** - Move tasks on board
3. **Create issues** - For new work identified
4. **Review PRs** - Help with code reviews
5. **Attend standups** - Daily sync-ups

## Resources

- **GitHub Projects Docs**: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- **Agile Best Practices**: https://www.atlassian.com/agile
- **Scrum Guide**: https://scrumguides.org/
- **Internal Wiki**: https://wiki.ninjait.io

## Support

**Need help with GitHub Projects?**
- **Slack**: #github-help
- **Email**: dev-support@ninjait.io
- **Documentation**: This file!

---

**Last Updated**: October 8, 2025  
**Version**: 1.0  
**Next Review**: Monthly

