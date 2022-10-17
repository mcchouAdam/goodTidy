# GoodTidy
<!--- <a href="https://goodtidy.site/">
     <img src="https://user-images.githubusercontent.com/3848886/195867178-68e9825d-d251-42fb-a182-6da1917a804c.png" alt="GoodTidy logo" align="right" height="60"  style="background-color:white"/>
</a> -->

<a href="https://goodtidy.site/">GoodTidy</a> is a handwriting note management and social website. It provides an optical character recognition (OCR), draggable and editable interface to make it easy to organize your notes and share your ideas with the world.

### Test Account

| User      | Email             | password    |
| --------- | ----------------- | ----------- |
| SAMSON    | SAMSON@gmail.com  | 12345678    |
| EVA       | EVA@gmail.com     | 12345678    |

--------------

### Do you have these problems?
+ Do you make a lot of notes on your own, but have no idea how to organize them?
+ Do you suddenly remember the key point of the teacher's teaching, but you are not sure which note it belongs in?
+ Are you curious about how other people write their notes on the topic you are interested in?

--------------

### Table of contents
1. [Features](#features)
2. [User flow](#user-flow)
3. [Techniques](#techniques)
   - [Brief Architecture](#%EF%B8%8F-brief-architecture)
   - [Draggable and Editable note element](#%EF%B8%8F-draggable-and-editable-note-element)
   - [Note Version Control and Autosave](#%EF%B8%8F-note-version-control-and-autosave)
4. [Demo](#demo)
   - [Upload the note and OCR from note images](#%EF%B8%8F-upload-the-note-and-ocr-from-note-images)
   - [Edit your notes](#%EF%B8%8F-edit-your-notes)
   - [Note Version Control](#%EF%B8%8F-note-version-control)
   - [Note Autosave](#%EF%B8%8F-note-autosave)
   - [Search the keyword in notes](#%EF%B8%8F-search-the-keyword-in-notes)
   - [Share your notes to social community](#%EF%B8%8F-share-your-notes-to-social-community)
   - [Discuss the note with your friends by annotation](#%EF%B8%8F-discuss-the-note-with-your-friends-by-annotation)
   - [Social Comments, Save Notes and Search notes](#%EF%B8%8F-social-comments-save-notes-and-search-notes)
5. [Refernece](#refernce)
6. [Contact](#contact)

--------------

## Features

- Optical Character Recognition (OCR) from note images
- Draggable and editable note element
- Note version control & Autosave
- Customize your note classification
- Search the keyword in your notes
- Share your notes with your friends and social community and displayed your friend's online status
- Discuss the note with your friends by flexible annotation
- Leave note comments in the social community and add favorite notes
- Real-Time Push Notification when someone shares or cancels sharing notes with you

--------------

## User flow
<img width="960" alt="user_flow" src="https://user-images.githubusercontent.com/3848886/195900068-17bb073b-7484-4c5d-8a73-7ad878f4d180.png">

--------------

## Techniques
### 🗒️ Brief Architecture
<div align="center">
    <img width="725" alt="Brief Acheticture" src="https://user-images.githubusercontent.com/3848886/195863041-22567ee0-76e2-441f-9e50-b2d34f69b167.png">
</div>

### 🗒️ Draggable and Editable note element
<div align="center">
    <img width="725" alt="Draggable and Editable note element" src="https://user-images.githubusercontent.com/3848886/195919264-e66bae67-dcc7-4b4b-9873-15af529804f1.png">
</div>

### 🗒️ Note Version Control and Autosave
<div align="center">
    <img width="725" alt="Note Version Control Autosave" src="https://user-images.githubusercontent.com/3848886/195919280-eb28804f-2bfb-403e-adc8-f5a6e8d092e1.png">
</div>

--------------

## Demo
### 🗒️ Upload the note and OCR from note images
* Extract the text and rectangular snip in your uploaded image.
* Cover the portions of the note image that you don't want to OCR.
* Combine the extracted text and snip image to upload your note.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195964881-d943636f-1891-4af0-861b-f4da0b4b17c4.gif" alt="Demo OCR" width="600"/>
</div>

### 🗒️ Edit your notes
* Edit your note with draggable images and textarea.
     * Note: The textarea will become editable and show the green frame after dragging it.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195965080-014a24a2-aaf0-4451-91d5-fd2ba7dad051.gif" alt="Demo Draggable and Editable note element" width="600"/>
</div>

### 🗒️ Note Version Control
* Save & load the note version.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195964110-d2c40ea8-8f84-4a1f-835c-5c2c85a0c6b3.gif" alt="Demo Note Version Control" width="600"/>
</div>

### 🗒️ Note Autosave
* The system will keep the note in the latest editing state if you abruptly exit the editing page without saving the note version.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195964381-893e1d05-19c1-4299-a42d-9d62579760cc.gif" alt="Demo Autosave" width="600"/>
</div>

### 🗒️ Search the keyword in your notes
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195963591-9f405a28-0254-43db-bba2-6a168005574f.gif" alt="Demo Search keyword" width="600"/>
</div>

### 🗒️ Share your notes to social community
* You can enable or disable the comment to everyone.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195963813-526f43f1-1733-40ef-9a3f-9fa567e55b38.gif" alt="Demo ShareToAll" width="600"/>
</div>

### 🗒️ Discuss the note with your friends by annotation
* Use the flexible annotation icon to discuss with your friend on the annotation page.
* The system will push a real-time notification when someone shares or cancels sharing notes with you.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195963390-c80a7b33-f9a9-4b9e-b0c0-4f59af4e058c.gif" alt="Demo Annotation" width="600"/>
</div>

### 🗒️ Social comments, save notes and search notes
* Leave comments in social community notes.
* Add your favorite notes.
* Filter the notes by searching with the author, shared time, note introduction, note content, tags, and your favorite notes.
<div align="center">
    <img src="https://user-images.githubusercontent.com/3848886/195908678-66dfca4c-be0b-43b9-aed7-81054679909d.gif" alt="Demo Social function" width="600"/>
</div>

--------------

## Reference
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/ocr)
- [MongoDB Altas](https://www.mongodb.com/atlas)
- [Socket.io](https://socket.io/)

--------------

## Contact
Email: <a href="mcchouadam@gmail.com">mcchouadam@gmail.com</a>
