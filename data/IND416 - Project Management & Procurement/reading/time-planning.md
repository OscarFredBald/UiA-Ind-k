# Chapter 5 – Time Planning & Scheduling

> "Time is the only project resource that can never be replenished."

---

# Learning Objectives

After completing this chapter you should be able to:

- Explain why scheduling is more than assigning dates.
- Construct a logical project network.
- Differentiate activities from milestones and deliverables.
- Calculate the Critical Path.
- Explain Float (Slack).
- Evaluate schedule risks.
- Compare Gantt Charts with Network Diagrams.
- Discuss schedule compression techniques.
- Critically evaluate unrealistic project schedules.

---

# Why Scheduling Matters

A common misconception is that scheduling simply involves placing activities into a calendar.

Professional project scheduling is fundamentally different.

Scheduling is the process of transforming project scope into an executable sequence of logically connected activities while respecting resource limitations, uncertainty and organizational priorities.

A poor schedule rarely causes projects to fail immediately.

Instead, it slowly destroys coordination.

Teams begin waiting for one another.

Equipment arrives too early.

Suppliers arrive too late.

Engineers become idle.

Costs increase.

Deadlines begin slipping.

Eventually, managers attempt to recover lost time by adding resources—often making the project even slower.

---

# Activities, Deliverables and Milestones

These concepts are frequently confused.

## Activity

Work that consumes both time and resources.

Examples:

- Design hull structure
- Develop software
- Install propulsion system

Activities have:

- duration
- predecessors
- successors
- required resources

---

## Deliverable

A measurable output produced by one or more activities.

Examples:

- Approved design
- Installed engine
- Completed warehouse

Deliverables create value.

Activities create deliverables.

---

## Milestone

A milestone represents an important event.

It has:

- zero duration
- no resource consumption

Examples:

- Contract signed
- Design approved
- Vessel delivered

Milestones allow managers to monitor project progress.

---

# Logical Relationships

Activities rarely exist independently.

Every activity depends upon others.

Example:

```

Foundation → Steel Structure → Roof → Electrical Installation

```

This is known as precedence logic.

Incorrect logic produces unrealistic schedules.

Professional schedulers therefore focus first on logical dependencies—not calendar dates.

---

# Network Diagrams

Network diagrams visualize dependencies.

Unlike Gantt charts, they emphasize relationships rather than time.

Example:

```

Requirements
|
v

Design
|
v

Development

/ \

v v

Testing Documentation

\ /

v

Deployment

```

These diagrams form the basis for Critical Path calculations.

---

# Critical Path Method (CPM)

The Critical Path is arguably the most important concept in scheduling.

Definition:

> The Critical Path is the longest sequence of dependent activities determining the minimum possible project duration.

If any activity on the Critical Path is delayed,

the entire project is delayed.

---

# Example

Imagine the following activities.

| Activity | Duration | Depends On |
|------------|----------|--------------|
| A | 4 | - |
| B | 6 | A |
| C | 3 | A |
| D | 5 | B |
| E | 2 | C |
| F | 4 | D & E |

The longest path determines the project duration.

Professional software performs these calculations automatically,

but project managers must understand the underlying logic.

---

# Float (Slack)

Not every activity is critical.

Some activities may be delayed without affecting project completion.

This flexibility is called Float.

Example:

Painting an office may have five days of Float.

Structural concrete curing may have zero.

Managers should allocate resources according to Float.

Critical activities deserve the greatest attention.

---

# Gantt Charts

The Gantt Chart is one of the world's most widely used planning tools.

Advantages:

- easy to understand
- communicates schedule visually
- tracks progress
- useful for reporting

Limitations:

- complex projects become difficult to read
- dependencies are less obvious
- hides schedule logic

For this reason experienced project managers often combine Gantt Charts with Network Diagrams.

---

# Schedule Risk

Schedules are predictions.

Predictions are uncertain.

Common schedule risks include:

- supplier delays
- permit approvals
- weather
- labor shortages
- equipment failure
- changing requirements

Professional planning therefore includes contingency rather than assuming everything proceeds perfectly.

---

# Schedule Compression

Sometimes deadlines cannot move.

Managers therefore compress schedules.

Two common techniques exist.

## Fast Tracking

Activities normally performed sequentially are performed simultaneously.

Advantage:

- shorter duration

Disadvantage:

- higher coordination risk

---

## Crashing

Additional resources are added to critical activities.

Advantage:

- faster completion

Disadvantages:

- higher cost
- diminishing returns
- communication overhead

Contrary to popular belief,

adding people does not always make projects faster.

---

# Brooks' Law

Fred Brooks famously stated:

> "Adding manpower to a late software project makes it later."

Why?

New employees require:

- training
- supervision
- communication

The existing team therefore becomes less productive before becoming more productive.

This principle also appears in many engineering projects.

---

# Case Study

A port authority plans to automate cargo handling.

Political leaders announce a fixed opening ceremony two years before planning begins.

The deadline becomes immovable.

Halfway through construction the project falls six weeks behind.

Management considers:

- adding more contractors
- working overtime
- overlapping testing with construction

Each decision reduces time,

but increases risk.

Professional project managers evaluate these trade-offs quantitatively rather than emotionally.

---

# Critical Reflection

Students often believe the purpose of scheduling is predicting completion dates.

It is not.

Its true purpose is supporting decision-making.

A schedule should help managers answer questions like:

- Where is project risk concentrated?
- Which activities deserve additional resources?
- What happens if this task slips by two weeks?
- Which activities can safely be postponed?

A schedule that cannot answer these questions is little more than a calendar.

---

# Key Concepts

| Concept | Meaning |
|---------|---------|
| Activity | Work consuming time and resources |
| Deliverable | Output produced by activities |
| Milestone | Zero-duration event |
| Critical Path | Longest dependent activity chain |
| Float | Permitted delay without delaying project completion |
| CPM | Critical Path Method |
| Fast Tracking | Parallel execution of activities |
| Crashing | Adding resources to reduce duration |

---

# Summary

Professional scheduling is not about creating beautiful Gantt Charts.

It is about understanding project logic.

Excellent project managers focus on:

- dependencies
- uncertainty
- resource constraints
- critical activities
- informed trade-offs

The schedule is not merely a reporting tool.

It is a decision-support system.

---

# Recommended Reading

- PMBOK Guide – Schedule Management
- Kerzner – *Project Management*
- Pinto – *Project Management*
- Goldratt – *Critical Chain*
