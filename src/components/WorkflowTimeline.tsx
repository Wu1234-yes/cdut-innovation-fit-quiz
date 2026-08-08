import type { DepartmentWorkflowStep } from '../content/types'

interface WorkflowTimelineProps {
  steps: DepartmentWorkflowStep[]
}

export function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  return (
    <ol className="workflow-timeline">
      {steps.map((step, index) => (
        <li key={step.title}>
          <div className="workflow-timeline__index">
            <span className="workflow-timeline__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="workflow-timeline__phase">PHASE</span>
          </div>
          <div className="workflow-timeline__body">
            <div className="workflow-timeline__heading">
              <h3>{step.title}</h3>
              <span className="workflow-timeline__state">SIGNAL READY</span>
            </div>
            <p>{step.description}</p>
            <span aria-hidden="true" className="workflow-timeline__track" />
          </div>
          <span aria-hidden="true" className="workflow-timeline__signal" />
        </li>
      ))}
    </ol>
  )
}
