async function noteUpload(
  blob,
  filename,
  user_id,
  note_name,
  timestamp,
  elements,
  note_classification,
  version_name,
  keywords,
  OCR_elements
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
  data.append('text_elements', JSON.stringify(OCR_elements));

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

// [編輯頁面] 點選筆記，顯示內容
async function noteShow(note_id) {
  // Assign Global Variable
  current_note_id = note_id;
  console.log(current_note_id);

  // 每次更換筆記都要洗掉之前的OCR物件
  OCR_ids = [];

  let note_ImgContent = showNote_note_obj[note_id].note_elements;
  let note_textContent = showNote_note_obj[note_id].note_textElements;
  let note_filename = showNote_note_obj[note_id].note_file_name;
  let $note_div = $('#update-note-content');
  $note_div.html('');
  note_bg = note_filename;

  const text_elements = text_elements_arr($note_div, note_textContent);
  const Img_elements = Img_draggable_arr(note_ImgContent);
  elements_init($note_div, Img_elements, text_elements);
  $('.contour-pic.ui-draggable.ui-draggable-handle')
    .draggable({
      containment: '#update-note-content',
    })
    .on('drag', stepDrag);
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
      // console.log('version', version_obj);

      let note_obj = {};
      let search_list_obj = {};
      let showNote_obj = {};
      let sharedNote_obj = {};

      // console.log('version_obj', version_obj);

      version_obj.map((s) => {
        console.log('看這: ', s);
        // console.log(s);
        const note_classification = s.note_classification;
        const note_file_name = s.file_name;
        const note_name = s.note_name;
        const note_lastVersion = s.lastVersion;
        const note_verInfo = s.version_info[s.version_info.length - 1]; //取最新版
        const note_elements = note_verInfo.elements;
        const note_keywords = note_verInfo.keywords;
        const note_id = s._id;
        const lastEdit_time = s.lastEdit_time;
        const note_textElements = note_verInfo.text_elements;
        const user_permission = s.user_permission;
        const user_picture = s.user_info[0].picture;
        const user_name = s.user_info[0].name;

        if (user_permission !== authorizationList['admin']) {
          // 筆記呈現頁
          if (!sharedNote_obj[note_name]) {
            sharedNote_obj[note_name] = {
              'note_elements': note_elements,
              'note_textElements': note_textElements,
              'note_file_name': note_file_name,
              'user_permission': user_permission,
              'user_picture': user_picture,
              'user_name': user_name,
            };
          }
        } else {
          if (!note_obj[note_classification]) {
            note_obj[note_classification] = {
              'note_name': [note_name],
              'note_elements': [note_elements],
              'note_textElements': [note_textElements],
              'note_keywords': [note_keywords],
              'note_lastVersion': [note_lastVersion],
              'note_id': [note_id],
              'lastEdit_time': [lastEdit_time],
            };
          } else {
            note_obj[note_classification].note_name.push(note_name);
            note_obj[note_classification].note_elements.push(note_elements);
            note_obj[note_classification].note_textElements.push(
              note_textElements
            );
            note_obj[note_classification].note_keywords.push(note_keywords);
            note_obj[note_classification].note_lastVersion.push(
              note_lastVersion
            );
            note_obj[note_classification].note_id.push(note_id);
            note_obj[note_classification].lastEdit_time.push(lastEdit_time);
          }

          // 搜尋列表頁的筆記
          if (!search_list_obj[note_name]) {
            search_list_obj[
              note_name
            ] = `${note_name}${note_keywords}${note_classification}`;
          } else {
            search_list_obj[
              note_name
            ] += `${note_name}${note_keywords}${note_classification}`;
          }

          // 筆記呈現頁
          if (!showNote_obj[note_id]) {
            showNote_obj[note_id] = {
              'note_elements': note_elements,
              'note_textElements': note_textElements,
              'note_file_name': note_file_name,
            };
          }
        }
      });

      // Deep copy the note_obj
      // 筆記列表呈現的內容
      note_list_obj = $.extend(true, [], note_obj);

      // 列表筆記搜尋欄需呈現的內容
      search_note_list_obj = $.extend(true, [], search_list_obj);

      // 點選列表筆記時需呈現的內容
      showNote_note_obj = $.extend(true, [], showNote_obj);

      // 點選列表筆記時需呈現的內容
      shared_note_obj = $.extend(true, [], sharedNote_obj);

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

// 特定人分享List的內容
async function getSharedNote(sharedNote_obj, div_append) {
  // console.log('sharedNote_obj', sharedNote_obj);

  div_append.html('');
  let shareNote_html = '';
  const note_names = Object.keys(sharedNote_obj);
  // sharedNote_obj.map((s) => {});
  note_names.map((id) => {
    const permission = sharedNote_obj[id].user_permission;
    const user_picture = sharedNote_obj[id].user_picture;
    const user_name = sharedNote_obj[id].user_name;
    shareNote_html += `
                        <img class="profile-pic mr-3" src="${S3_HOST}user_picture/${user_picture}">
                        <span>${user_name}</span>
                        <input type="radio" class="btn-check" name="shareNote_options" id="${id}" value="${id}" autocomplete="off">
                        <label class="btn btn-secondary" for="${id}">${id}</label>
                        <span class="badge bg-success rounded-pill">${permissionToName[permission]}</span><br \>
                        `;
  });
  div_append.append(shareNote_html);
}

// 版本回復List的內容
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
          showVerObj[v.version_name] = {
            'elements': v.elements,
            'text_elements': v.text_elements,
          };
          name_html += `<input type="radio" class="btn-check" name="version_options" id="${v.version_name}" value="${v.version_name}" autocomplete="off">
                    <label class="btn btn-secondary" for="${v.version_name}">${v.version_name}</label>`;
        });
        div_append.append(name_html);
      }
    });
    return showVerObj;
  }
}

// 回復版本資訊
async function noteShowFromVer(name, Obj) {
  // console.log('version_recovery: ', showVerObj[version_name]);
  $('#update-note-content').html('');
  const Img_elements = Img_draggable_arr(Obj[name].elements);
  // console.log(Img_elements);
  const text_elements = text_elements_arr(
    $('#update-note-content'),
    Obj[name].text_elements
  );
  elements_init($('#update-note-content'), Img_elements, text_elements);
}

// 查看特定人分享 -------------------------------------------------------
async function sharedNoteShow(name, Obj) {
  $('#update-note-content').html('');
  console.log('name:', name, 'Obj: ', Obj);
  note_bg = Obj[name].note_file_name;
  const Img_elements = Img_draggable_arr(Obj[name].note_elements);
  const text_elements = text_elements_arr(
    $('#update-note-content'),
    Obj[name].note_textElements
  );
  elements_init($('#update-note-content'), Img_elements, text_elements);
}

// 改名筆記 ------------------------------------------------------------
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
