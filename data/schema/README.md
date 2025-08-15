# Data schema notes

District object
- district_id string
- name string
- region string
- spending object with instruction admin operations other numbers
- per_pupil_spending number
- per_pupil_debt number
- aggregate_spending number
- aggregate_debt number

Campus object
- campus_id string
- district_id string
- name string
- on_grade_reading_pct number
- on_grade_math_pct number
- avg_teacher_salary number
