// 筆記上傳 API ----------------------------
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
    url: `/api/1.0/note`,
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

  let note_ImgContent = showNote_note_obj[note_id].note_elements;
  let note_textContent = showNote_note_obj[note_id].note_textElements;
  let note_filename = showNote_note_obj[note_id].note_file_name;
  let click_notename = showNote_note_obj[note_id]['note_name'];
  let $note_div = $('#update-note-content');

  $('#click_note_name').html(click_notename);
  // console.log('showNote_note_obj', showNote_note_obj);

  // $('#update-note-name').html(showNote_note_obj[note_id]['note_name']);

  // 每次更換筆記都要洗掉之前的OCR物件
  OCR_ids = [];

  $note_div.html('');
  note_bg = note_filename;

  const text_elements = text_elements_arr($note_div, note_textContent);
  const Img_elements = Img_elements_arr(note_ImgContent);
  elements_init($note_div, Img_elements, text_elements);
  $('.contour-pic.ui-draggable.ui-draggable-handle')
    .draggable({
      containment: '#update-note-content',
    })
    .css('position', 'absolute')
    .on('drag', stepDrag);

  // 物件生成後，才可以抓取物件click
  pictureClick();
  textareaClick();

  // 打開自動儲存
  $('#autoSave-toggle').prop('checked', true);
  AutoSave.start();
}

// [function][筆記編輯頁面] 圖形點選框選
function pictureClick() {
  $('.contour-pic.ui-draggable.ui-draggable-handle').dblclick(function (e) {
    let click_element = $('#' + e.currentTarget.id);

    if (click_element.hasClass('highlight')) {
      click_element.removeClass('highlight');
    } else {
      click_element.addClass('highlight');
    }
  });
}

// [function][筆記編輯頁面] 文字點選框選
function textareaClick() {
  $('.addtextarea').dblclick(function (e) {
    let click_element = e.currentTarget.parentNode;
    let click_id = e.target.id;

    // 取消框選
    if (click_element.classList.contains('highlight')) {
      click_element.classList.remove('highlight');
      if (OCR_delete_ids.indexOf(click_id) !== -1) {
        OCR_delete_ids.splice(click_id, 1);
      }
      // 框選
    } else {
      click_element.classList.add('highlight');
      OCR_delete_ids.push(click_id);
    }
  });
}

// [function][筆記編輯頁面] 文字點選框選

// 剛進入畫面時拿取User的筆記資訊
async function getUserNotes() {
  let config = {
    method: 'get',
    url: `/api/${API_VERSION}/notes`,
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

        console.log(note_name, user_permission);
        console.log(user_id);

        // 只要自己不是筆記的admin就是別人分享給你的
        if (user_permission !== authorizationList['admin']) {
          // 別人分享給你的筆記
          if (!sharedNote_obj[note_name]) {
            sharedNote_obj[note_name] = {
              'note_id': note_id,
              'note_elements': note_elements,
              'note_textElements': note_textElements,
              'note_file_name': note_file_name,
              'user_permission': user_permission,
              'user_picture': user_picture,
              'user_name': user_name,
            };
          }
          // 自己的筆記
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
              'note_classification': note_classification,
              'note_name': note_name,
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

      // 點選筆記特定人分享時需呈現的內容
      shared_note_obj = $.extend(true, [], sharedNote_obj);

      // Show the NoteListNav
      showNoteList(note_obj, $('#sidebar-nav'));
    })
    .catch((error) => {
      // Loading取消
      $body.removeClass('loading');

      console.log(error);
    });
}

// 筆記導覽列
async function showNoteList(note_obj, div_append) {
  console.log('note_obj: ', note_obj);
  const classifications = Object.keys(note_obj);
  let all_html = '';
  let classification_html = '';
  let notes_html = '';
  let note_menu_html = '';

  classifications.map((classfi) => {
    console.log('classfi: ', classfi);
    let ids = note_obj[classfi].note_id;
    let names = note_obj[classfi].note_name;

    // 相同分類的筆記 全部串一起
    for (let i = 0; i < names.length; i++) {
      note_menu_html = `
              <div class="d-flex flex-row align-items-center">
                <a
                  class="btn"
                  id="dropdownMenuLink"
                  href="#"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i class="bi bi-three-dots" style="margin-top: -0.16rem;"></i>
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                  <a class="dropdown-item" href="javascript:renameNote('${ids[i]}')">
                    修改名稱
                  </a>
                  <a class="dropdown-item" href="javascript:deleteNote('${ids[i]}')">
                    刪除
                  </a>
                  <a class="dropdown-item" href="javascript:moveNote('${ids[i]}')">
                    搬移
                  </a>
                </div>
              </div>`;

      notes_html += `
        <ul class="nav-content collapse" id="note_${classfi}" data-bs-parent="#sidebar-nav">
          <li>
            <a href="javascript:noteShow('${ids[i]}', $('#update-note-content'))">
              <i class="bi bi-circle"></i>
              <span>${names[i]}</span>
              ${note_menu_html}
            </a>
          </li>
        </ul>`;
    }

    // 分類的tag html
    classification_html = `
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-target="#note_${classfi}" data-bs-toggle="collapse" href="#">
          <i class="bi bi-menu-button-wide"></i>
            <span>${classfi}</span>
          <i class="bi bi-chevron-down ms-auto"></i>
        </a>
        ${notes_html}
      </li>`;

    all_html += classification_html;
    classification_html = '';
    notes_html = '';
    note_menu_html = '';
  });

  div_append.append(all_html);
}

async function showSearchList(note_obj, div_append) {
  div_append.html('');
  const classification = Object.keys(note_obj);
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

  div_append.append(name_html);
}

// [其他人分享給您的筆記] 特定人分享List的內容
async function getSharedNote(sharedNote_obj, div_append) {
  console.log('sharedNote_obj', sharedNote_obj);

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
  console.log(shareNote_html);
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
  const Img_elements = Img_elements_arr(Obj[name].elements);
  // console.log(Img_elements);
  const text_elements = text_elements_arr(
    $('#update-note-content'),
    Obj[name].text_elements
  );
  elements_init($('#update-note-content'), Img_elements, text_elements);

  // 讓圖片可以移動
  $('.contour-pic.ui-draggable.ui-draggable-handle')
    .draggable({
      containment: '#update-note-content',
    })
    .css('position', 'absolute')
    .on('drag', stepDrag);
}

// 查看特定人分享 -------------------------------------------------------
async function sharedNoteShow(name, Obj) {
  $('#update-note-content').html('');
  console.log('name:', name, 'Obj: ', Obj);
  note_bg = Obj[name].note_file_name;
  const user_permission = Obj[name].user_permission;
  const Img_elements = Img_elements_arr(Obj[name].note_elements);
  const text_elements = textarea_nondraggable_arr(
    $('#update-note-content'),
    Obj[name].note_textElements
  );
  elements_init($('#update-note-content'), Img_elements, text_elements);
  $('textarea').prop('disabled', true);
  $('textarea').draggable({ 'disable': true });
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
    url: `/api/1.0/note`,
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
      url: `/api/1.0/note`,
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
      url: `/api/1.0/noteClass`,
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
    url: `/api/1.0/noteClass`,
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
      url: `/api/1.0/noteClass`,
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

// 註釋 ------------------------------------------------------
// 鎖定註釋
async function lockAnnotation(annotation_id) {
  let annotation_icon_html = '';
  let icon_class = '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle';
  let annotation_icon_count = $(icon_class).length;
  $('#textarea-' + annotation_id).prop('disabled', true);
  $('#icon-' + annotation_id).draggable('disable');

  for (let i = 0; i < annotation_icon_count; i++) {
    annotation_icon_html += $(icon_class).get(i).outerHTML;
  }

  console.log(annotation_icon_html);
}

// 修改註釋
async function modifyAnnotation(annotation_id) {
  const isModified = window.confirm('確定修改此註釋?');
  if (!isModified) {
    return;
  }
  // alert($('#' + annotation_id).val());
  $('#textarea-' + annotation_id).prop('disabled', false);
  $('#icon-' + annotation_id).draggable({ disabled: false });
}

async function deleteAnnotation(annotation_id) {
  const isDeleted = window.confirm('確定刪除此註釋?');
  if (!isDeleted) {
    return;
  }

  $('#icon-' + annotation_id).remove();
  $('#form-group-' + annotation_id).remove();
}

// 儲存註釋 ---
async function saveAnnotation(annotion_user_id, note_id) {
  const isSaved = window.confirm('確定要儲存全部的註釋?');
  if (!isSaved) {
    return;
  }
  let annotation_icon_html = '';
  let annotation_textarea = [];
  let annotation_user_name = [];
  let annotation_icon_class =
    '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle';
  let annotation_textarea_class = 'textarea.form-control';
  let annotation_user_name_class = '.bg-info';
  let annotation_icon_count = $(annotation_icon_class).length;
  let annotation_textare_count = $(annotation_textarea_class).length;
  let annotation_user_name_count = $(annotation_user_name_class).length;

  // 儲存註釋 icon的html
  for (let i = 0; i < annotation_icon_count; i++) {
    annotation_icon_html += $(annotation_icon_class).get(i).outerHTML;
  }

  // 儲存註釋 textarea的值
  for (let i = 0; i < annotation_textare_count; i++) {
    annotation_textarea.push($(annotation_textarea_class).get(i).value);
  }

  // 儲存註釋 留言人名
  for (let i = 0; i < annotation_user_name_count; i++) {
    annotation_user_name.push($(annotation_user_name_class).get(i).innerHTML);
  }

  // axios儲存資料庫
  let data = {
    'note_id': note_id,
    'annotion_user_id': annotion_user_id,
    'annotation_icon_html': annotation_icon_html,
    'annotation_textarea': JSON.stringify(annotation_textarea),
    'annotation_user_name': JSON.stringify(annotation_user_name),
  };

  let config = {
    method: 'POST',
    url: '/api/1.0/annotation',
    data: data,
  };

  await axios(config)
    .then(function (response) {
      console.log(response);
      alert('儲存註釋成功');
      location.reload();
    })
    .catch(function (error) {
      console.log(error);
      alert('儲存註釋失敗');
    });
}

// 拿取註釋資料 ---
async function getAnnotation(note_id) {
  let config = {
    method: 'GET',
    url: `/api/1.0/annotation/${note_id}`,
    data: '',
  };

  await axios(config)
    .then(function (response) {
      current_annotation_element = response.data[0];
      console.log('拿取註釋成功');
    })
    .catch(function (error) {
      console.log(error);
      console.log('拿取註釋失敗');
    });
}

// 呈現註釋
async function showAnnotation(
  textarea_div_append,
  icon_div_append,
  annotation_element,
  user_permission
) {
  // 顯示註釋icon
  if (!annotation_element) {
    return;
  }

  const annotation_icon_html = annotation_element.annotation_icon_html;
  const annotation_icon = $.parseHTML(annotation_icon_html);
  icon_div_append.append(annotation_icon);
  $(
    '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle.ui-draggable-disabled'
  )
    .css('position', 'absolute')
    .draggable({ containment: '#update-note-content' });

  // 顯示註釋textarea
  const annotation_text = annotation_element.annotation_textarea;
  const annotation_user_name = annotation_element.annotation_user_name;
  const note_id = annotation_element.note_id;
  const annotation_count = annotation_text.length;
  let annotation_id;
  let textarea_html = '';

  for (id = 1; id <= annotation_count; id++) {
    annotation_id = `${note_id}_annotation_${id}`;

    // 組合annotation
    let textarea_modify_icon_html = '';

    console.log('user_permission: ', user_permission);
    if (user_permission >= 2) {
      textarea_modify_icon_html = `
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item" href="javascript:lockAnnotation('${annotation_id}')">
                          鎖定
                        </a>
                        <a class="dropdown-item" href="javascript:modifyAnnotation('${annotation_id}')">
                          修改
                        </a>
                        <a class="dropdown-item" href="javascript:deleteAnnotation('${annotation_id}')">
                          移除
                        </a>
                      </div>`;
    }

    let annotation_menu_html = `
                    <div class="d-flex flex-row align-items-center">
                      <a
                        class="btn"
                        id="dropdownMenuLink"
                        href="#"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i class="bi bi-three-dots" style="margin-top: -0.16rem;"></i>
                        ${textarea_modify_icon_html}
                      </a>
                    </div>`;

    let annotation_html = `
                          <div class="form-group" id="form-group-${annotation_id}">
                            <span class="badge bg-dark rounded-pill">${id}</span>
                            <span class="badge bg-info rounded-pill">${
                              annotation_user_name[id - 1]
                            }</span>
                            <textarea class="form-control" id="textarea-${annotation_id}" rows="3" placeholder="您想註釋什麼?...">${
      annotation_text[id - 1]
    }</textarea>
                            ${annotation_menu_html}
                          </div>`;

    textarea_html += annotation_html;
  }

  textarea_div_append.append(textarea_html);
  // console.log(annotation_element);
}
