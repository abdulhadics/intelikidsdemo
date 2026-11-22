# IntelliKids SRS Brief for the FYP Team

## Development model

Use the **Incremental Development Model**. Define the requirements for the entire platform in the SRS, then assign each requirement to a release. Each release includes requirements analysis, design, implementation and acceptance testing. The first release delivers the student learning flow. Supervisor and committee feedback informs later releases. The sprints in the proposal can be used to organize work within each increment.

## Problem and users

Primary-school learners need a way to watch lessons, practice concepts and see their progress. IntelliKids combines lessons and assessment with optional visual focus feedback. The main actors are students, teachers and parents. The first increment supports student learning and basic lesson publishing through Strapi. Later increments add teacher workflows and parent reporting.

## Requirements to include

| ID | Requirement | Delivery | Acceptance evidence |
| --- | --- | --- | --- |
| FR-01 | A student shall be able to sign in, open the student dashboard and sign out. Protected routes require a student session. | First increment | Invalid sign-in shows an error. Valid sign-in opens the dashboard. Sign-out protects lesson routes again. |
| FR-02 | An authenticated student shall be able to select a published lesson and control video playback. | First increment | Open either Grade 3 lesson from the catalogue and play, pause or seek the bundled video. |
| FR-03 | A student shall be able to opt in to webcam-based focus feedback during playback. The app shall show the latest result and release the camera on pause, finish, disable or exit. | First increment | Enable the camera and observe an inference result. Move out of view and observe the unavailable state. Pause and confirm capture stops. |
| FR-04 | A student shall be able to submit an objective checkpoint answer and see whether it is correct. | First increment | Submit a wrong choice, then a correct choice. Verify the correct submission marks the lesson complete. |
| FR-05 | A student shall be able to see their saved completion status after returning or reloading. | First increment | Reload the Progress screen and verify the same lesson remains complete. |
| FR-06 | A teacher shall be able to manage lessons and organize material by subject and grade. The system shall support lesson session summaries and visibility events. | Planned | Publish a lesson, open it as a student and verify a session summary. |
| FR-07 | A student shall be able to submit written and spoken answers and receive a score with an explanation. | Planned | Compare the explanation and score with a predefined answer rubric. |
| FR-08 | A student shall be able to explore curated STEM resources and receive learning recommendations. | Planned | Verify that curated content appears and recommendations change with learning activity. |
| FR-09 | Teachers and parents shall be able to see authorized progress reports. The app shall support Urdu localization. | Planned | Verify that both roles see only their authorized records and can switch language. |
| FR-10 | A teacher with CMS access shall be able to open the lesson form from the student portal, upload a video and publish the lesson. | First increment | Verify the direct link, draft visibility and playback of the published upload in the student app. |

Quality requirements should cover visible errors, keyboard controls, camera opt-in, frame disposal and continued playback when the camera or model is unavailable. Model output is an estimate from visible eye patches. Classroom accuracy must be evaluated separately. Keep architecture and database diagrams in the design section if the department uses a combined SRDS. Use the same requirement IDs in the SRS, design and acceptance tests.

## Committee questions and answers

**Why did you choose Incremental Development?**

Our platform has features with different dependencies. The first release connects authentication, content, video, focus detection and assessment in one working student flow. We can review each release with the supervisor and use that evidence to plan the next one.

**What do you mean by the 30% milestone?**

We propose the first working increment for the 30% review. The demo covers student access, two published lectures, live focus feedback, objective questions and saved progress. The supervisor or committee’s rubric determines the official percentage.

**How is this different from a prototype?**

This release uses actual application services, reads lesson records from Strapi, runs the existing CNN on the local machine and stores checkpoint completion in SQLite. It provides a working basis for the next release.

**How does focus detection work?**

The browser captures an opted-in camera frame during playback. OpenCV detects the face and eyes, then runs the trained CNN from an ONNX export to classify the eye patches. The browser updates the status. When a face or eyes cannot be detected, it reports an unavailable reading.

**What is the difference between the checkpoint and the final assessment module?**

The current checkpoint grades one fixed multiple-choice question per lesson and tracks completion. The planned assessment module will evaluate open-ended written and spoken answers and explain the score against a rubric.

**How will you demonstrate it?**

Start the local services, sign in, pick a lesson, show the camera status, then answer the question and reload the Progress page. All runtime services and lesson media run on the demo laptop after setup.
