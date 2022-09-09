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
      alert('上傳筆記成功');
    })
    .catch(function (error) {
      console.log(error);
      alert('上傳筆記失敗');
    });
}

async function noteShow(note_id) {
  const bearer_token = localStorage.getItem('Authorization');
  if (bearer_token) {
    var config = {
      method: 'get',
      url: `${server}/updateNote/${note_id}`,
      headers: {
        'Authorization': bearer_token,
      },
      data: '',
    };
  }

  // 抓取筆記資料
  await axios(config)
    .then((response) => {
      console.log(response);
      // 重畫
      let note_content = response.data[0].elements;
      let note_filename = response.data[0].file_name;
      let $note_div = $('#update-note-content');
      note_bg = note_filename;
      $note_div.html('');
      elements_init($note_div, note_content);
    })
    .catch((error) => {
      console.log(error);
      alert('登入失敗，請重新登入');
    });
}

async function getUserNotes() {
  const bearer_token = localStorage.getItem('Authorization');
  if (bearer_token) {
    var config = {
      method: 'get',
      url: `${server}/api/${API_VERSION}/notes`,
      headers: {
        'Authorization': bearer_token,
      },
      data: '',
    };
  }

  // 抓取筆記資料
  await axios(config)
    .then((response) => {
      const data = response.data;
      let note_obj = {};
      data.map((s) => {
        const note_classification = s.note_classification;
        const note_name = s.note_name;
        const note_all_elements = s.elements;
        const id = s._id;

        if (!note_obj[note_classification]) {
          note_obj[note_classification] = {
            'names': [note_name],
            'elements': [note_all_elements],
            'id': [id],
          };
        } else {
          note_obj[note_classification].names.push(note_name);
          note_obj[note_classification].elements.push(note_all_elements);
          note_obj[note_classification].id.push(id);
        }
      });
      //   console.log(note_obj);
      showNoteList(note_obj);
    })
    .catch((error) => {
      console.log(error);
      alert('筆記抓取資料失敗');
    });
}

async function showNoteList(note_obj) {
  //   console.log(note_obj);
  const classification = Object.keys(note_obj);
  let mb1_html = $('<li class="mb-1"></li>');
  let name_html = '';
  let classification_html = '';

  classification.map((c) => {
    let ids = note_obj[c].id;
    let names = note_obj[c].names;

    classification_html += `<button
            class="btn btn-toggle align-items-center rounded collapsed"
            data-bs-toggle="collapse"
            data-bs-target="#${c}-collapse"
            aria-expanded="true"
          >
            ${c}
          </button><div class="collapse show" id="${c}-collapse">
            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">`;

    for (let i = 0; i < names.length; i++) {
      name_html += `<li><a href="javascript:noteShow(
        '${ids[i]}'
      )" class="link-dark rounded">${names[i]}</a></li>`;
    }

    classification_html += name_html;
    classification_html += `</ul></div>`;
    console.log(classification_html);
    name_html = '';
  });

  mb1_html.append(classification_html);
  $('.list-unstyled').append(mb1_html);
}
