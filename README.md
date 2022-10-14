# Do you have these problems?

- You made a lot of notes on your own, but no idea how to organize them.
- You suddenly remembered the keypoint of the teacher teaching, but you are not sure which note it belongs in.
- You were curious about how other people write their notes.

# GoodTidy [<img src="./docs/goodTidy_logo.png" width="150px" style="float:right;" >](https://goodtidy.site/)



GoodTidy is a handwriting note management and social website. It provides an optical character recognition
(OCR), draggable and editable interface to make it easy to organize your notes and share your ideas with the world

## Features

- Upload the note
- Optical Character Recognition (OCR) from note images
- Draggable and editable note editor
- Note version control
- Note autosave
- Created the organized note classification
- Search the keyword in notes
- Share your notes to your friends and social community
- Discuss the note with your friends by annotation
- Social comments in social community and save the other user's note you liked
- System pushing real-time notification and displayed shared friend online status

## Implement

- Upload the note
  - using canvas graphics to preview and block selection
- Optical Character Recognition (OCR) from note images
  - Integrate with [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
  - Detect and extract text from any image in upload notes
  - Store and process the coordinated information in [MongoDB Altas](https://www.mongodb.com/atlas)
  - 
- ## Draggable and editable note editor
- Note version control
  - Store the note image and text
  -
- Note autosave
- Created the organized note classification
- Search the keyword in notes
- Share your notes to your friends and social community
- Discuss the note with your friends by annotation
- Social comments in social community and save the other user's note you liked
- System pushing real-time notification and displayed shared friend online status

## Demo

<img src="./docs/test2.gif" alt="drawing" width="600"/>

## System Architecture

![alt text](/docs/GoodTidy_system_architecture.png 'SystemArchitecture')
