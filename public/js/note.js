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
  // console.log(showNote_note_obj[note_id]);
  // Assign Global Variable
  current_note_id = note_id;
  console.log(current_note_id);

  let note_content = showNote_note_obj[note_id].note_elements;
  let note_filename = showNote_note_obj[note_id].note_file_name;
  let $note_div = $('#update-note-content');
  note_bg = note_filename;
  $note_div.html('');
  elements_init($note_div, note_content);
}

async function getUserNotes() {
  let config = {
    method: 'get',
    url: `${server}/api/${API_VERSION}/notes`,
    data: '',
  };

  // 抓取筆記資料
  await axios(config)
    .then((response) => {
      const data = response.data;
      version_obj = data;
      console.log('version', version_obj);
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
            'note_lastVersion': [note_lastVersion],
            'note_id': [note_id],
            'lastEdit_time': [lastEdit_time],
          };
        } else {
          note_obj[note_classification].note_name.push(note_name);
          note_obj[note_classification].note_elements.push(note_elements);
          note_obj[note_classification].note_keywords.push(note_keywords);
          note_obj[note_classification].note_lastVersion.push(note_lastVersion);
          note_obj[note_classification].note_id.push(note_id);
          note_obj[note_classification].lastEdit_time.push(lastEdit_time);
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

      // Show the NoteListNav
      showNoteList(note_obj, $('#search-list'));
    })
    .catch((error) => {
      console.log(error);
      alert('請先登入');
    });
}

// 筆記導覽列
async function showNoteList(note_obj, div_append) {
  const classification = Object.keys(note_obj);
  let mb1_html = $('<li class="mb-1"></li>');
  let name_html = '';
  let classification_html = '';

  classification.map((c) => {
    let ids = note_obj[c].note_id;
    let names = note_obj[c].note_name;

    classification_html += `
          <button
            class="btn btn-toggle align-items-center rounded collapsed"
            data-bs-toggle="collapse"
            data-bs-target="#${c}-collapse"
            aria-expanded="true"
          >${c}
          </button><div class="collapse show" id="${c}-collapse">
            <a href="javascript:renameclassification('${user_id}','${c}')"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
            <a href="javascript:deleteclassification('${user_id}','${c}')"><i class="fa fa-trash-o" aria-hidden="true"></i></a></li>
            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">`;

    for (let i = 0; i < names.length; i++) {
      name_html += `<li><a href="javascript:noteShow('${ids[i]}')" class="link-dark rounded">${names[i]}</a>
      <a href="javascript:renameNote('${ids[i]}')"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a>
      <a href="javascript:deleteNote('${ids[i]}')"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
      <a href="javascript:moveNote('${ids[i]}')"><i class="fa fa-arrows-alt" aria-hidden="true"></i></a>
      </li>`;
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

async function getVersionList(version_obj, div_append) {
  div_append.html('');
  if (!current_note_id) {
    div_append.text('請先選擇一個筆記');
    return;
  } else {
    let showVerObj = {};
    let name_html = '';

    version_obj.map((o) => {
      if (o.note_id == current_note_id) {
        const version_info = o.version_info;
        version_info.map((v) => {
          showVerObj[v.version_name] = v.elements;
          name_html += `<input type="radio" class="btn-check" name="version_options" id="${v.version_name}" value="${v.version_name}" autocomplete="off">
                    <label class="btn btn-secondary" for="${v.version_name}">${v.version_name}</label>`;
        });
        div_append.append(name_html);
      }
    });
    return showVerObj;
  }
}

// TODO: 跟noteShow一起重構
async function noteShowFromVer(version_name, showVerObj) {
  console.log(showVerObj[version_name]);
  $('#update-note-content').html('');
  elements_init($('#update-note-content'), showVerObj[version_name]);
}

// 改名筆記
async function renameNote(note_id) {
  const new_noteName = window.prompt('請問您的筆記要改什麼名字?');
  if (!new_noteName) {
    alert('名字不能為空');
    return;
  }
  data = {
    'note_id': note_id,
    'new_noteName': new_noteName,
  };

  let config = {
    method: 'PATCH',
    url: `${server}/api/1.0/note`,
    data: data,
  };

  await axios(config)
    .then(function (response) {
      console.log(response);
      alert('改名筆記成功');
      location.reload();
    })
    .catch(function (error) {
      console.log(error);
      alert('改名筆記失敗');
    });
}

// 刪除筆記
async function deleteNote(note_id) {
  const isdeleted = window.confirm(`確定修改刪除?`);
  if (isdeleted) {
    data = {
      'note_id': note_id,
    };

    let config = {
      method: 'DELETE',
      url: `${server}/api/1.0/note`,
      data: data,
    };

    await axios(config)
      .then(function (response) {
        console.log(response);
        alert('刪除筆記成功');
        location.reload();
      })
      .catch(function (error) {
        console.log(error);
        alert('刪除筆記失敗');
      });
  }
}

// 搬移筆記
async function moveNote(note_id) {
  const MoveToClass = window.prompt('您要搬移到哪個分類?');
  if (!MoveToClass) {
    alert('分類不能為空');
    return;
  } else {
    data = {
      'note_id': note_id,
      'MoveToClass': MoveToClass,
    };

    let config = {
      method: 'PATCH',
      url: `${server}/api/1.0/noteClass`,
      data: data,
    };

    await axios(config)
      .then(function (response) {
        console.log(response);
        alert('搬移筆記成功');
        location.reload();
      })
      .catch(function (error) {
        console.log(error);
        alert('搬移筆記失敗');
      });
  }
}

// 改名分類
async function renameclassification(user_id, old_classificationName) {
  const new_classificationName = window.prompt('請問您的分類要改什麼名字?');
  if (!new_classificationName) {
    alert('分類名字不能為空');
    return;
  }

  data = {
    'user_id': user_id,
    'old_classificationName': old_classificationName,
    'new_classificationName': new_classificationName,
  };

  let config = {
    method: 'PATCH',
    url: `${server}/api/1.0/noteClass`,
    data: data,
  };

  await axios(config)
    .then(function (response) {
      console.log(response);
      alert('改名分類成功');
      location.reload();
    })
    .catch(function (error) {
      console.log(error);
      alert('改名分類失敗');
    });
}

// 刪除分類
async function deleteclassification(user_id, classificationName) {
  const isdeleted = window.confirm(
    '確定刪除此分類?(會連同一分類裡的筆記一同刪除)'
  );
  if (isdeleted) {
    data = {
      'user_id': user_id,
      'classificationName': classificationName,
    };

    let config = {
      method: 'DELETE',
      url: `${server}/api/1.0/noteClass`,
      data: data,
    };

    await axios(config)
      .then(function (response) {
        console.log(response);
        alert('刪除分類成功');
        location.reload();
      })
      .catch(function (error) {
        console.log(error);
        alert('刪除分類失敗');
      });
  }
}
