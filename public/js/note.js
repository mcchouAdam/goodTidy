async function noteUpload(
  blob,
  filename,
  user_id,
  note_name,
  timestamp,
  elements,
  note_classification
) {
  // 檔案上傳s3
  let data = new FormData();
  data.append('user_note_upload', blob, filename);
  data.append('user_id', user_id);
  data.append('note_name', note_name);
  data.append('timestamp', timestamp);
  data.append('file_name', filename);
  data.append('elements', elements);
  data.append('note_classification', note_classification);

  let config = {
    method: 'post',
    url: `${server}/api/1.0/note`,
    data: data,
  };

  await axios(config)
    .then(function (response) {
      console.log(response);
      console.log('上傳筆記成功');
    })
    .catch(function (error) {
      console.log(error);
      console.log('上傳筆記失敗');
    });
}
