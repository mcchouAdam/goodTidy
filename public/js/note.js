async function noteUpload(
  blob,
  filename,
  user_id,
  note_name,
  timestamp,
  elements,
  note_classification,
  version_name,
  keywords
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
  data.append('version_name', version_name);
  data.append('keywords', keywords);

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
  //   console.log(showNote_note_obj[note_id]);
  // 重畫
  let note_content = showNote_note_obj[note_id].note_elements;
  let note_filename = showNote_note_obj[note_id].note_file_name;
  let $note_div = $('#update-note-content');
  note_bg = note_filename;
  $note_div.html('');
  elements_init($note_div, note_content);
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
      console.log(data);
      let note_obj = {};
      let search_list_obj = {};
      let showNote_obj = {};
      data.map((s) => {
        // console.log(s);
        const note_classification = s.note_classification;
        const note_file_name = s.file_name;
        const note_name = s.note_name;
        const note_lastVersion = s.lastVersion;
        const note_verInfo = s.version_info[s.version_info.length - 1];
        const note_elements = note_verInfo.elements;
        const note_keywords = note_verInfo.keywords;
        const note_id = s._id;
        const lastEdit_time = s.lastEdit_time;

        if (!note_obj[note_classification]) {
          note_obj[note_classification] = {
            'note_name': [note_name],
            'note_elements': [note_elements],
            'note_keywords': [note_keywords],
            'note_id': [note_id],
            'lastEdit_time': [lastEdit_time],
          };
        } else {
          note_obj[note_classification].note_name.push(note_name);
          note_obj[note_classification].note_elements.push(note_elements);
          note_obj[note_classification].note_keywords.push(note_keywords);
          note_obj[note_classification].note_lastVersion.push(note_lastVersion);
          note_obj[note_classification].note_id.push(id);
          note_obj[note_classification].time.push(time);
        }

        if (!search_list_obj[note_name]) {
          search_list_obj[
            note_name
          ] = `${note_name}${note_keywords}${note_classification}`;
        } else {
          search_list_obj[
            note_name
          ] += `${note_name}${note_keywords}${note_classification}`;
        }

        if (!showNote_obj[note_id]) {
          showNote_obj[note_id] = {
            'note_elements': note_elements,
            'note_file_name': note_file_name,
          };
        }
      });
      // Deep copy the note_obj
      note_list_obj = $.extend(true, [], note_obj);
      search_note_list_obj = $.extend(true, [], search_list_obj);
      showNote_note_obj = $.extend(true, [], showNote_obj);
      console.log(search_note_list_obj);
      console.log(showNote_note_obj);
      showNoteList(note_obj, $('#search-list'));
    })
    .catch((error) => {
      console.log(error);
      alert('筆記抓取資料失敗');
    });
}

async function showNoteList(note_obj, div_append) {
  const classification = Object.keys(note_obj);
  let mb1_html = $('<li class="mb-1"></li>');
  let name_html = '';
  let classification_html = '';

  classification.map((c) => {
    let ids = note_obj[c].note_id;
    let names = note_obj[c].note_name;

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

    name_html = '';
  });

  mb1_html.append(classification_html);
  div_append.append(mb1_html);
  //   $('.list-unstyled').append(mb1_html);
}

async function showSearchList(note_obj, div_append) {
  div_append.html('');
  const classification = Object.keys(note_obj);
  let mb1_html = $('<li class="mb-1"></li>');
  let name_html = '';

  classification.map((c) => {
    let ids = note_obj[c].note_id;
    let names = note_obj[c].note_name;

    for (let i = 0; i < names.length; i++) {
      name_html += `<li><a href="javascript:noteShow(
        '${ids[i]}'
      )" class="link-dark rounded">${names[i]}</a></li>`;
    }
  });

  mb1_html.append(name_html);
  div_append.append(mb1_html);
  //   $('.list-unstyled').append(mb1_html);
}
