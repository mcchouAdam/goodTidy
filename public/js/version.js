// 撈資料庫的版本資料 ------------------------------------
async function load_version() {
  // 查詢note-name ----------------------
  const query_note_result = await axios({
    method: 'GET',
    url: `api/1.0/note/${note_name}`,
    responseType: 'json',
  });

  const note_elements = query_note_result.data;

  return note_elements;
}

// 印出版本選項
async function show_version(ver_info) {
  // 重置
  $('.dropdown-content').html('');

  // Append版本
  for (let i = ver_info.length - 1; i >= 0; i--) {
    let item = $(
      `<div>
        <input type="radio" name="version" value="${i}">${ver_info[i].ver_name}
            <img class="version-img" src="${S3_HOST}${ver_info[i].ver_img}"></img>
        </div>`
    );
    $('.dropdown-content').append(item);
  }
}

// TODO: show version;
// window.onload = async function () {
//   ver_info = await load_version();
//   show_version(ver_info);
// };
