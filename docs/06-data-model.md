# Data Model Draft

## 핵심 객체

```text
Program
ProgramTemplate
Cohort
Track
User
RoleAssignment
Team
Module
Content
LearningPiece
LearningOutcome
Artifact
Submission
Feedback
Rubric
RubricItem
Evaluation
MentoringSession
Survey
RiskSignal
ReminderCandidate
Notice
ActivityLog
AuditLog
AccessLog
SystemSetting
PwaSetting
ScheduleTemplate
```

## 객체 요약

### Cohort

- id
- program_id
- name
- year
- agreement_date
- start_date
- end_date
- status

### RoleAssignment

- id
- user_id
- role
- scope_type
- scope_id
- starts_at
- ends_at
- status

### LearningPiece

- id
- cohort_id
- module_id
- content_id
- title
- type
- completion_rule
- requires_submission
- requires_approval
- requires_evaluation
- opens_at
- due_at
- status

### Artifact

- id
- cohort_id
- artifact_type
- title
- owner_type
- owner_id
- linked_learning_piece_id
- status
- final_confirmed

### MentoringSession

- id
- cohort_id
- target_type
- target_id
- mentor_id
- scheduled_at
- status
- external_meeting_url
- notes
- linked_artifact_id

### RiskSignal

- id
- cohort_id
- target_type
- target_id
- risk_type
- severity
- related_object_type
- related_object_id
- owner_id
- action_status
- action_note

### Survey

- id
- cohort_id
- title
- survey_type
- external_url
- opens_at
- due_at
- target_scope_type
- target_scope_id
- linked_outcome_id
- response_tracking_status

### ActivityLog

- id
- cohort_id
- user_id
- target_type
- target_id
- event_type
- previous_state
- next_state
- occurred_at
- metadata

### AuditLog

- id
- actor_user_id
- action
- target_type
- target_id
- previous_value
- next_value
- occurred_at
- metadata

### AccessLog

- id
- user_id
- event_type
- occurred_at
- ip_address
- device_info
- user_agent

## 템플릿과 인스턴스 분리

복제 가능한 템플릿:

- 모듈 구조
- 콘텐츠 구조
- 학습피스 구조
- 루브릭
- 학습성과 목록
- 상대 일정 템플릿

복제하지 않는 운영 데이터:

- 참여자
- 멘토 배정
- 팀 구성
- 제출물
- 피드백
- 평가 결과
- 로그

## 상대 일정 템플릿

```text
ScheduleTemplate
├─ 기준점: 협약일 / 오리엔테이션일 / 프로그램 시작일 / 모듈 시작일
├─ 오프셋: D+7 / W+2 / M+1
├─ 적용 객체: 모듈 / 콘텐츠 / 학습피스 / 산출물 / 멘토링
└─ 생성 규칙
```
