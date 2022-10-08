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
  const data = new FormData();
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

  const config = {
    method: 'post',
    url: '/api/1.0/note',
    data,
  };

  // console.log('upload data:', data);

  await axios(config)
    .then((response) => {
      // console.log(response);
      const note_id = response.data.data;
      Swal.fire({
        icon: 'success',
        title: '上傳筆記成功',
        showConfirmButton: false,
        timer: 1000,
      }).then(() => {
        localStorage.setItem('UPLOADNOTEID', note_id);
        window.location.assign('/note');
      });
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.data.error,
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

// [編輯頁面] 點選筆記，顯示內容
async function noteShow(note_id) {
  // 指定全域變數
  current_note_id = note_id;

  // 移除nav list裡面的active
  $('.nav-content a.active').removeClass('active');
  $(`#noteList_${note_id}`).addClass('active');

  // 筆記已被刪除
  if (!showNote_note_obj[note_id]) {
    return;
  }

  const note_ImgContent = showNote_note_obj[note_id].note_elements;
  const note_textContent = showNote_note_obj[note_id].note_textElements;
  const note_filename = showNote_note_obj[note_id].note_file_name;
  const { note_classification } = showNote_note_obj[note_id];
  const click_notename = showNote_note_obj[note_id].note_name;
  const $note_div = $('#update-note-content');

  $('#click_note_classification').html(note_classification);
  $('#click_note_name').html(click_notename);

  $note_div.html('');
  note_bg = note_filename;

  addDragImage($note_div, note_ImgContent, 'draggable');

  note_textContent.map((s) => {
    addDragTextarea(
      '#update-note-content',
      s.text,
      s.width,
      s.height,
      s.textTop,
      s.textLeft,
      'draggable'
    );
  });

  // const Img_elements = Img_elements_arr(note_ImgContent);
  // elements_init($note_div, Img_elements, text_elements);
  // $('.contour-pic.ui-draggable.ui-draggable-handle')
  //   .draggable({
  //     containment: '#update-note-content',
  //   })
  //   .css('position', 'absolute');

  // 打開自動儲存
  $('#autoSave-toggle').prop('checked', true);
  await AutoSave.start();
}

// [function][筆記編輯頁面] 文字點選框選

// 剛進入畫面時拿取User的筆記資訊
async function getUserNotes() {
  const config = {
    method: 'get',
    url: `/api/${API_VERSION}/notes`,
    data: '',
  };

  // 抓取筆記資料
  await axios(config)
    .then((response) => {
      const { data } = response;
      version_obj = data;

      // console.log('version', version_obj);

      const note_obj = {};
      const search_list_obj = {};
      const showNote_obj = {};
      const sharedNote_obj = {};

      // console.log('version_obj', version_obj);

      version_obj.map((s) => {
        // console.log(s);
        const { note_classification } = s;
        const note_file_name = s.file_name;
        const { note_name } = s;
        const note_lastVersion = s.lastVersion;
        const note_verInfo = s.version_info[s.version_info.length - 1]; // 取最新版
        const note_elements = note_verInfo.elements;
        const note_keywords = note_verInfo.keywords;
        const note_id = s._id;
        const { lastEdit_time } = s;
        const note_textElements = note_verInfo.text_elements;
        const { user_permission } = s;
        const user_picture = s.user_info[0].picture;
        const user_name = s.user_info[0].name;
        const user_email = s.user_info[0].email;

        // console.log(note_name, user_permission);
        // console.log(user_id);

        // 只要自己不是筆記的admin就是別人分享給你的
        if (user_permission !== authorizationList.admin) {
          // 別人分享給你的筆記
          if (!sharedNote_obj[note_name]) {
            sharedNote_obj[note_name] = {
              note_id,
              note_elements,
              note_textElements,
              note_file_name,
              user_permission,
              user_picture,
              user_name,
              user_email,
            };
          }
          // 自己的筆記
        } else {
          if (!note_obj[note_classification]) {
            note_obj[note_classification] = {
              note_name: [note_name],
              note_elements: [note_elements],
              note_textElements: [note_textElements],
              note_keywords: [note_keywords],
              note_lastVersion: [note_lastVersion],
              note_id: [note_id],
              lastEdit_time: [lastEdit_time],
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
              note_classification,
              note_name,
              note_elements,
              note_textElements,
              note_file_name,
            };
          }
        }
      });

      // Deep copy the note_obj
      // 筆記列表呈現的內容
      note_list_obj = $.extend(true, [], note_obj);
      console.log('note_list_obj', note_list_obj);

      // 列表筆記搜尋欄需呈現的內容
      search_note_list_obj = $.extend(true, [], search_list_obj);

      // 點選列表筆記時需呈現的內容
      showNote_note_obj = $.extend(true, [], showNote_obj);

      // 點選筆記特定人分享時需呈現的內容
      shared_note_obj = $.extend(true, [], sharedNote_obj);
      // 呈現有分享給你的文章數
      $('#sharedNoteCount').text(Object.keys(shared_note_obj).length);

      // Loading -----------------------------------
      // $('.wrapper-loading').remove();
      // $('body').removeClass('cover-loading');
    })
    .catch((error) => {
      // Loading取消
      // $body.removeClass('loading');
      console.log(error);
    });
}

// 筆記導覽列
async function showNoteList(note_obj, div_append) {
  // console.log('note_obj: ', note_obj);

  div_append.html('');
  const classifications = Object.keys(note_obj);
  let all_html = '';
  let classification_html = '';
  let notes_html = '';
  let note_menu_html = '';

  classifications.map((classfi) => {
    // console.log('classfi: ', classfi);
    const ids = note_obj[classfi].note_id;
    const names = note_obj[classfi].note_name;

    // 相同分類的筆記 全部串一起
    for (let i = 0; i < names.length; i++) {
      note_menu_html = '';
      notes_html += `
        <ul class="nav-content collapse" id="note_${classfi}" data-bs-parent="#sidebar-nav">
          <li>
            <a id="noteList_${ids[i]}" href="javascript:noteShow('${ids[i]}', $('#update-note-content'))">
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
        <a id="noteClass_${classfi}" class="nav-link collapsed" data-bs-target="#note_${classfi}" data-bs-toggle="collapse" href="#">
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

  let num = 1;
  classification.map((c) => {
    const ids = note_obj[c].note_id;
    const names = note_obj[c].note_name;

    for (let i = 0; i < names.length; i++) {
      name_html += `
            <div style="font-size:16px; font-weight:500; margin:5px 0;">
              <span class="small badge bg-primary rounded-pill">${num}</span>
              <a href="javascript:noteShow('${ids[i]}')" class="link-dark rounded">${names[i]}</a>
            </div>
          `;
      num++;
    }
  });

  if (classification.length == 0) {
    name_html = `
            <div style="font-size:16px; font-weight:500; margin:5px 0;">
              <span>您目前還沒有上傳筆記</span>
            </div>
          `;
  }

  div_append.append(name_html);
}

// [其他人分享給您的筆記] 特定人分享List的內容
async function getSharedNote(sharedNote_obj, div_append) {
  console.log('sharedNote_obj', sharedNote_obj);

  if (!sharedNote_obj) {
    return;
  }

  div_append.html('');
  let shareNote_html = '';
  const note_names = Object.keys(sharedNote_obj);
  if (note_names.length === 0) {
    shareNote_html = '<p>沒有人分享筆記給您</p>';
    div_append.append(shareNote_html);
    return;
  }

  let num = 1;
  note_names.map((id) => {
    const permission = sharedNote_obj[id].user_permission;
    const { user_picture } = sharedNote_obj[id];
    const { user_name } = sharedNote_obj[id];
    const shared_uer_email = sharedNote_obj[id].user_email;

    let user_online_status_html = '';
    if (online_user[shared_uer_email] == '' || !online_user[shared_uer_email]) {
      user_online_status_html = `<span id="online_${shared_uer_email}" class="badge bg-secondary rounded-pill">離線</span>`;
    } else {
      user_online_status_html = `<span id="online_${shared_uer_email}" class="badge bg-success rounded-pill">上線</span>`;
    }
    // <button class="btn"><i class="bi bi-chat-dots"></i></button>
    shareNote_html += `
            <div>
              <span class="badge bg-dark rounded-pill" style="color:white;">${num++}</span>
              ${user_online_status_html}
              <img class="profile-pic mr-3" src="${S3_HOST}user_picture/${user_picture}">
              <span>${user_name}</span>
              <input type="radio" class="btn-check btn" name="shareNote_options" id="${id}" value="${id}" autocomplete="off">
              <label class="btn" for="${id}" style="margin:0 0 0 20px;">${id}</label>
              <span class="badge bg-warning rounded-pill" style="color:black;float:right;margin:15px 0 0 0;"">${
                permissionToName[permission]
              }</span><br \>
            </div>
              `;
  });
  // console.log(shareNote_html);
  div_append.append(shareNote_html);
}

// 版本回復List的內容
async function getVersionList(version_obj, div_append) {
  div_append.html('');
  if (!current_note_id) {
    div_append.text('請先選擇一個筆記');
  } else {
    const showVerObj = {};
    let name_html = '';

    let num = 1;
    version_obj.map((o) => {
      if (o.note_id == current_note_id) {
        const { version_info } = o;

        version_info.map((v) => {
          showVerObj[v.version_name] = {
            elements: v.elements,
            text_elements: v.text_elements,
            created_time: v.created_time,
          };

          vName_timeFormat = timeConverter(new Date(v.version_name));
          name_html += `
                <span class="badge bg-primary rounded-pill">${num}</span>
                <input type="radio" class="btn-check" name="version_options" id="${v.version_name}" value="${v.version_name}" autocomplete="off">
                <label class="btn btn-light" for="${v.version_name}">${vName_timeFormat}</label>
                <br />
              `;

          // <span class="small" style="float:right; margin:8px;">
          //   ${timeConverter(new Date(v.created_time))}
          // </span>;
          num++;
        });
        div_append.append(name_html);
      }
    });
    return showVerObj;
  }
}

// 回復版本資訊
async function noteShowFromVer(name, Obj) {
  $('#update-note-content').html('');
  addDragImage($('#update-note-content'), Obj[name].elements, 'draggable');
  const text_elements = Obj[name].text_elements;
  text_elements.map((e) => {
    addDragTextarea(
      '#update-note-content',
      e.text,
      e.width,
      e.height,
      e.textTop,
      e.textLeft,
      'draggable'
    );
  });
}

// 改名筆記 ------------------------------------------------------------
async function renameNote(note_id) {
  Swal.fire({
    title: '修改筆記名稱',
    text: '您的筆記要改什麼名稱?',
    icon: 'question',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off',
    },
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    showLoaderOnConfirm: true,
    preConfirm: (new_noteName) => new_noteName,
    allowOutsideClick: () => !Swal.isLoading(),
  }).then(async (result) => {
    if (result.isConfirmed) {
      const new_noteName = result.value;
      if (new_noteName == '') {
        Swal.fire({
          icon: 'error',
          title: '筆記名稱不能空白',
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        data = {
          note_id,
          new_noteName,
        };

        const config = {
          method: 'PATCH',
          url: '/api/1.0/note',
          data,
        };

        await axios(config)
          .then(async (response) => {
            console.log(response);
            // 拿取User所有note的資訊;
            await getUserNotes();
            // 畫出NavList資訊
            await showNoteList(note_list_obj, $('#sidebar-nav'));
            // 重新點選該筆記
            await notePreClick();

            Swal.fire({
              icon: 'success',
              title: `筆記名稱已修改成 ${new_noteName}`,
              showConfirmButton: false,
              timer: 1000,
            });
          })
          .catch((error) => {
            console.log(error);
            Swal.fire({
              icon: 'error',
              title: error.response.data.error,
              showConfirmButton: false,
              timer: 1000,
            });
          });
      }
    }
  });
}

// 刪除筆記
async function deleteNote(note_id) {
  Swal.fire({
    title: '您確定要刪除此篇筆記?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      data = {
        note_id,
      };

      const config = {
        method: 'DELETE',
        url: '/api/1.0/note',
        data,
      };

      await axios(config)
        .then(async (response) => {
          console.log(response);
          current_note_id = undefined;
          // 拿取User所有note的資訊;
          await getUserNotes();
          // 畫出NavList資訊
          await showNoteList(note_list_obj, $('#sidebar-nav'));
          // 剛開始就點選筆記
          await notePreClick();

          Swal.fire({
            icon: 'success',
            title: '刪除筆記成功',
            showConfirmButton: false,
            timer: 1000,
          });

          // 清空現在的current_note_id
          localStorage.removeItem('CURRENTNOTEID');
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: '刪除筆記失敗',
            // title: error.response.data.error,
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });
}

// 搬移筆記
async function moveNote(note_id) {
  const note_classes = Object.keys(note_list_obj);
  let class_index;
  await Swal.fire({
    title: '搬移此筆記至不同的分類',
    icon: 'question',
    input: 'select',
    inputOptions: note_classes,
    inputPlaceholder: '選擇一個分類',
    showCancelButton: true,
    cancelButtonText: '取消',
    inputValidator: (value) => {
      if (!value) {
        Swal.fire({
          icon: 'error',
          title: '請選擇分類',
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        class_index = value;
      }
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      const MoveToClass = note_classes[class_index];
      data = {
        note_id,
        MoveToClass,
      };

      const config = {
        method: 'PATCH',
        url: '/api/1.0/noteClass',
        data,
      };

      await axios(config)
        .then(async (response) => {
          console.log(response);
          Swal.fire({
            icon: 'success',
            title: '搬移筆記成功',
            showConfirmButton: false,
            timer: 1000,
          });
          // location.reload();
          // 拿取User所有note的資訊;
          await getUserNotes();
          // 畫出NavList資訊
          await showNoteList(note_list_obj, $('#sidebar-nav'));
          // 剛開始就點選筆記
          await notePreClick();
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: '搬移筆記失敗',
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });
}

// 改名分類
async function renameclassification(user_id) {
  const note_classes = Object.keys(note_list_obj);
  let class_options_html = '';
  for (let i = 0; i < note_classes.length; i++) {
    class_options_html += `<option value="${note_classes[i]}">${note_classes[i]}</option>`;
  }

  let class_index;
  await Swal.fire({
    title: '修改筆記分類名稱',
    text: '您的筆記分類要改什麼名稱?',
    icon: 'question',
    html: `<div>
            <span>原分類名稱</span>
            <select name="classes" id="modifyClass-select" class="swal2-select">${class_options_html}</select>
          </div>
          <div>
            <span">新分類名稱</span>
            <input type="text" id="new_classname" class="swal2-input" style="width: 50%;"> 
          </div>`,
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    focusConfirm: false,
    preConfirm: () => [
      $('#modifyClass-select').find(':selected').val(),
      $('#new_classname').val(),
    ],
  }).then(async (result) => {
    if (result.isConfirmed) {
      const old_classificationName = $('#modifyClass-select')
        .find(':selected')
        .val();
      const new_classificationName = $('#new_classname').val();

      if (!new_classificationName) {
        Swal.fire({
          icon: 'error',
          title: '新分類名字不得為空',
          showConfirmButton: false,
          timer: 1000,
        });
        return;
      }

      data = {
        user_id,
        old_classificationName,
        new_classificationName,
      };

      const config = {
        method: 'PATCH',
        url: '/api/1.0/noteClass',
        data,
      };

      await axios(config)
        .then(async (response) => {
          console.log(response);
          // 拿取User所有note的資訊;
          await getUserNotes();
          // 畫出NavList資訊
          await showNoteList(note_list_obj, $('#sidebar-nav'));
          // 重新點選該筆記
          await notePreClick();
          Swal.fire({
            icon: 'success',
            title: `已將分類 ${config.data.old_classificationName} 改成 ${config.data.new_classificationName}`,
            showConfirmButton: false,
            timer: 1000,
          });

          // location.reload();
        })
        .catch((error) => {
          console.log(error);
          // Swal.fire('改名分類失敗');
          Swal.fire({
            icon: 'error',
            title: '改名分類成功',
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });

  // ---------------------------------------------------------------------

  // const new_classificationName = window.prompt('請問您的分類要改什麼名字?');

  // if (!new_classificationName) {
  //   Swal.fire('分類名字不能為空');
  //   return;
  // }

  // data = {
  //   user_id,
  //   old_classificationName,
  //   new_classificationName,
  // };

  // const config = {
  //   method: 'PATCH',
  //   url: '/api/1.0/noteClass',
  //   data,
  // };

  // await axios(config)
  //   .then((response) => {
  //     console.log(response);
  //     Swal.fire('改名分類成功');
  //     location.reload();
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     Swal.fire('改名分類失敗');
  //   });
}

// 刪除分類
async function deleteclassification(user_id, classificationName) {
  const isdeleted = window.confirm(
    '確定刪除此分類?(會連同一分類裡的筆記一同刪除)'
  );
  if (isdeleted) {
    data = {
      user_id,
      classificationName,
    };

    const config = {
      method: 'DELETE',
      url: '/api/1.0/noteClass',
      data,
    };

    await axios(config)
      .then((response) => {
        console.log(response);
        Swal.fire('刪除分類成功');
        location.reload();
      })
      .catch((error) => {
        console.log(error);
        Swal.fire('刪除分類失敗');
      });
  }
}

// 註釋 ------------------------------------------------------
// 鎖定註釋
async function lockAnnotation(annotation_id) {
  let annotation_icon_html = '';
  const icon_class =
    '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle';
  const annotation_icon_count = $(icon_class).length;
  $(`#textarea-${annotation_id}`).prop('disabled', true);
  $(`#icon-${annotation_id}`).draggable('disable');

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
  // Swal.fire($('#' + annotation_id).val());
  $(`#textarea-${annotation_id}`).prop('disabled', false);
  $(`#icon-${annotation_id}`).draggable({
    disabled: false,
  });
}

// 刪除註釋
async function deleteAnnotation(annotation_id) {
  Swal.fire({
    title: '您確定刪除此註釋?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      $(`#icon-${annotation_id}`).remove();
      $(`#form-group-${annotation_id}`).remove();

      // icon的id與編碼要重新排順序
      const icon_count = $('.fa-comments').length - 1; // 第一個是工具列的工具icon
      for (let i = 1; i <= icon_count; i++) {
        const comments_arr = $('.fa-comments')[i].id.split('_');
        comments_arr[comments_arr.length - 1] = i;
        const new_id = comments_arr.join('_');
        $('.fa-comments')[i].id = new_id;
        $('.fa-comments')[
          i
        ].innerHTML = `<span class="badge bg-dark rounded-pill">${i}</span>`;
      }

      // textarea的id與編碼要重新排序
      const textarea_count = $('.form-control').length;
      for (let i = 1; i <= textarea_count; i++) {
        const textarea_arr = $('.form-control')[i - 1].id.split('_');
        textarea_arr[textarea_arr.length - 1] = i;
        const new_id = textarea_arr.join('_');
        $('.form-control')[i - 1].id = new_id;
      }

      // formgroup的id與編碼要重新排序
      const formgroup_count = $('.form-group').length;
      for (let i = 1; i <= formgroup_count; i++) {
        const formgroup_arr = $('.form-group')[i - 1].id.split('_');
        formgroup_arr[formgroup_arr.length - 1] = i;
        const new_id = formgroup_arr.join('_');
        console.log('new_id', new_id);
        $('.form-group')[i - 1].id = new_id;
        $('.form-group span.bg-dark')[i - 1].innerHTML = i;
      }

      // href也要重新排序
      const href_count = $('div.dropdown-menu a.dropdown-item').length;
      for (let i = 1; i <= href_count; i++) {
        const { href } = $('div.dropdown-menu a.dropdown-item')[i - 1];
        const new_id = annotation_id.substring(0, annotation_id.length - 1) + i;
        const new_href = `javascript:deleteAnnotation('${new_id}')`;
        $('div.dropdown-menu a.dropdown-item')[i - 1].href = new_href;
      }
    }
  });
}

// 儲存註釋 ---
async function saveAnnotation(annotion_user_id, note_id) {
  Swal.fire({
    title: '您確定要儲存全部的註釋?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '儲存',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      let annotation_icon_html = '';
      const annotation_textarea = [];
      const annotation_user_name = [];
      const annotation_icon_class =
        '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle';
      const annotation_textarea_class = 'textarea.form-control';
      const annotation_user_name_class = '.bg-info';
      const annotation_icon_count = $(annotation_icon_class).length;
      const annotation_textare_count = $(annotation_textarea_class).length;
      const annotation_user_name_count = $(annotation_user_name_class).length;

      // 儲存註釋 icon的html
      for (let i = 0; i < annotation_icon_count; i++) {
        annotation_icon_html += $(annotation_icon_class).get(i).outerHTML;
      }

      // 儲存註釋 textarea的值
      for (let i = 0; i < annotation_textare_count; i++) {
        if ($(annotation_textarea_class).get(i).value == '') {
          Swal.fire({
            icon: 'error',
            title: '註釋不能為空白',
            showConfirmButton: false,
            timer: 1000,
          });
          return;
        }
        annotation_textarea.push($(annotation_textarea_class).get(i).value);
      }

      // 儲存註釋 留言人名
      for (let i = 0; i < annotation_user_name_count; i++) {
        annotation_user_name.push(
          $(annotation_user_name_class).get(i).innerHTML
        );
      }

      // axios儲存資料庫
      const data = {
        note_id,
        annotion_user_id,
        annotation_icon_html,
        annotation_textarea: JSON.stringify(annotation_textarea),
        annotation_user_name: JSON.stringify(annotation_user_name),
      };

      const config = {
        method: 'POST',
        url: '/api/1.0/annotation',
        data,
      };

      await axios(config)
        .then((response) => {
          console.log(response);
          Swal.fire({
            icon: 'success',
            title: '儲存註釋成功',
            showConfirmButton: false,
            timer: 1000,
          }).then((result) => {
            location.reload();
          });
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: error.response.data.data,
            showConfirmButton: false,
            timer: 1000,
          });
        });
    }
  });
}

// 拿取註釋資料 ---
async function getAnnotation(note_id) {
  const config = {
    method: 'GET',
    url: `/api/1.0/annotation/${note_id}`,
    data: '',
  };

  await axios(config)
    .then((response) => {
      console.log('註釋', response);
      current_annotation_element = response.data.data[0];
      console.log('拿取註釋成功');
    })
    .catch((error) => {
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

  // 註釋icon
  const { annotation_icon_html } = annotation_element;
  const annotation_icon = $.parseHTML(annotation_icon_html);

  // 顯示註釋textarea
  const annotation_text = annotation_element.annotation_textarea;
  const { annotation_user_name } = annotation_element;
  const { note_id } = annotation_element;
  const annotation_count = annotation_text.length;
  let annotation_id;
  let textarea_html = '';

  for (id = 1; id <= annotation_count; id++) {
    annotation_id = `${note_id}_annotation_${id}`;

    // 重新換掉icon的id與標記數字
    annotation_icon[id - 1].id = `icon-${annotation_id}`;
    annotation_icon[
      id - 1
    ].innerHTML = `<span class="badge bg-dark rounded-pill">${id}</span>`;

    // 組合annotation
    let textarea_modify_icon_html = '';

    // <a class="dropdown-item" href="javascript:lockAnnotation('${annotation_id}')">鎖定</a>
    // <a class="dropdown-item" href="javascript:modifyAnnotation('${annotation_id}')">修改</a>
    // console.log('user_permission: ', user_permission);

    if (user_permission >= 2) {
      textarea_modify_icon_html = `
        <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <a class="dropdown-item" href="javascript:deleteAnnotation('${annotation_id}')">
            移除
          </a>
        </div>`;
    }

    const annotation_menu_html = `
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

    const annotation_html = `
        <div class="form-group" id="form-group-${annotation_id}">
          <span class="badge bg-dark rounded-pill">${id}</span>
          <span style="font-size:15px;" class="badge bg-info rounded-pill">${
            annotation_user_name[id - 1]
          }</span>
          <textarea class="form-control" id="textarea-${annotation_id}" rows="3" placeholder="您想註釋什麼?...">${
      annotation_text[id - 1]
    }</textarea>
          ${annotation_menu_html}
        </div>`;

    textarea_html += annotation_html;
  }

  // 文字框與icon加回去
  textarea_div_append.append(textarea_html);
  icon_div_append.append(annotation_icon);
  $(
    '.fa.fa-solid.fa-comments.ui-draggable.ui-draggable-handle.ui-draggable-disabled'
  )
    .css('position', 'absolute')
    .draggable({
      containment: '#update-note-content',
    });
  // console.log(annotation_element);
}

// 刪除筆記物件
async function deleteNoteElement(type, id) {
  Swal.fire({
    title: '您確定要刪除選取的物件?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '刪除',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      let delete_item;
      let restoreObj = {};
      //上下一步
      switch (type) {
        case 'img':
          delete_item = $(`#${id}`)[0];
          restoreObj = {
            item: delete_item,
            event: 'delete',
            top: delete_item.style.top,
            left: delete_item.style.left,
          };
          break;
        case 'textarea':
          delete_item = $(`#${id}`).parents()[0];
          restoreObj = {
            item: delete_item,
            event: 'delete',
            top: delete_item.style.top,
            left: delete_item.style.left,
            width: delete_item.style.width,
            height: delete_item.style.height,
            val: $(`#${id}`).val(),
          };
          break;
      }
      // 儲存上下一步
      stepAppend(restoreObj);
      // 刪除物件
      delete_item.remove();
    }
  });
}

// [儲存/上傳]筆記物件
async function getImgElement(page) {
  const contourImg_count = $('.contour-pic').length;
  let element_html = '';
  for (let i = 0; i < contourImg_count; i++) {
    element_html += $('.contour-pic').get(i).outerHTML;
  }
  if (page === 'uploadNote') {
    return element_html.replaceAll(previewBlah.src, '');
  } else if (page === 'note') {
    const file_name = `${S3_HOST}notes/${note_bg}`;
    return element_html.replaceAll(file_name, '');
  }
}

async function getTextElement() {
  let OCR_elements = [];
  $('.div_addtextarea').map((i, e) => {
    let obj = {};
    const OCR_top = e.style.top;
    const OCR_left = e.style.left;
    const OCR_width = e.style.width;
    const OCR_height = e.style.height;
    const OCR_text = e.firstChild.nextElementSibling.value;
    // .replaceAll('<', '&lt;')
    // .replaceAll('>', '&gt;');
    obj = {
      'textTop': OCR_top,
      'textLeft': OCR_left,
      'width': OCR_width,
      'height': OCR_height,
      'text': OCR_text,
    };
    OCR_elements.push(obj);
  });

  return OCR_elements;
}

async function generateKeywords() {
  // 搜尋使用的keywords，將全部的字串串起來
  const ek = $('.addtextarea')
    .map((_, el) => el.value)
    .get();
  const keywords = ek.join('').replaceAll('\n', '').replace(/\s/g, '');
  return keywords;
}

// export { getImgElement, getTextElement };
