# GoodTidy
<a href="https://goodtidy.site/">
    <img src="https://user-images.githubusercontent.com/3848886/195867178-68e9825d-d251-42fb-a182-6da1917a804c.png" alt="GoodTidy logo" align="right" height="60" style="background-color:white"/>
</a>

<a href="https://goodtidy.site/">GoodTidy</a> is a handwriting note management and social website. It provides an optical character recognition (OCR), draggable and editable interface to make it easy to organize your notes and share your ideas with the world.

--------------

### Do you have these problems?
+ You made a lot of notes on your own, but no idea how to organize them.
+ You suddenly remembered the keypoint of the teacher teaching, but you are not sure which note it belongs in.
+ You were curious about how other people write their notes.

### Table of contents


## External Links and Test Account

### Links

### Test Account

| User      | Email             | password    |
| --------- | ----------------- | ----------- |
| SAMSON    | SAMSON@gmail.com  | 12345678    |
| EVA       | EVA@gmail.com     | 12345678    |

--------------

## Features

- Upload the note
- Optical Character Recognition (OCR) from note images
- Draggable and editable note editor
- Note version control & autosave
- Created the organized note classification
- Search the keyword in notes
- Share your notes to your friends and social community
- Discuss the note with your friends by annotation 
- Social comments in social community and save the other user's note you liked
- System pushing real-time notification and displayed shared friend online status

--------------

## Implementation

- Upload the note
  + using canvas graphics to preview and block selection
- Optical Character Recognition (OCR) from note images
  + Integrate with [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
  + Detect and extract text from any image in upload notes
  + Store and process the coordinated information in [MongoDB Altas](https://www.mongodb.com/atlas)
- Draggable and editable note editor
- Note version control
  + Store the note image and text 
- Note autosave
- Created the organized note classification
- Search the keyword in notes
- Share your notes to your friends and social community
- Discuss the note with your friends by annotation 
- Social comments in social community and save the other 
user's note you liked
- System pushing real-time notification and displayed shared friend online status

--------------

## Techniques
<img width="725" alt="Brief acheticture" src="https://user-images.githubusercontent.com/3848886/195863041-22567ee0-76e2-441f-9e50-b2d34f69b167.png">

--------------

## Demo
### upload
<img src="https://user-images.githubusercontent.com/3848886/195862658-3d841100-d142-47fb-8244-c705d3ae54bc.gif" alt="drawing" width="600"/>



