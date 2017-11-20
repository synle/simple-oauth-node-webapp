(function(){
    var odOptions = {
        clientId: window.client_id,
        action: "query",
        multiSelect: true,
        advanced: {
            queryParameters: "select=id,name,size,file,folder,photo,@microsoft.graph.downloadUrl",
            filter: "folder,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
            accessToken: window.access_token,
        },
        success: function(resp) {
            /* success handler */

            window.access_token = resp.accessToken;

            var new_files = resp.value;

            new_files = new_files.map(file => {
                const file_id = file['id'];
                delete file['@odata.context'];
                delete file['@microsoft.graph.downloadUrl'];
                delete file['file'];

                file.sizeString = (file.size / 1000 / 1000).toFixed(2) + ' MB'

                if(!window.files_hash[file_id]){
                    window.files_hash[file_id] = file;
                } else {
                    file.is_selected = false;
                }

                return file;
            });


            var current_selected_files = _getCurrentFiles();


            // preselect if it's less than max allowed
            if(current_selected_files.length <= window.MAX_ALLOWED_FILES){
                current_selected_files = current_selected_files.map(
                    function(current_file){
                        current_file.is_selected = true;
                        return current_file;
                    }
                )
            }

            _renderFiles(current_selected_files);
        },
        cancel: function() {
            /* cancel handler */
            console.log('cancel handler')
        },
        error: function(e) {
            /* error handler */
            console.log('error handler', e)
        },
    }


    window.onOpenSelectFilesToSync = _launchOneDrivePicker;

    window.onSubmitFileToSync = function(){
        var selected_items = Object.values(window.files_hash)
            .filter(file => file.is_selected)
            .map(file => {
                return {
                    id: file.id,
                    name: file.name,
                }
            })


        ajaxUtil.postJson(
            '/files_queue',
            { files: selected_items }
        ).then(
            function(){
                alert('Files are scheduled to be migrated: \n' + selected_items);
            },
            function(){
                alert('error')
            }
        )

        // stop form from being posted...
        return false;
    }

    window.onFileSelectCheckboxChanged = function(e){
        var current_file_id = e.target.dataset.value;
        var is_selected = e.target.checked;

        // update the select states...
        window.files_hash[current_file_id].is_selected = is_selected

        // re-render
        _renderFiles(_getCurrentFiles());
    }

    // init
    _init();
    // end init...

    function _init(){
        _renderFiles();
    }

    // private
    function _launchOneDrivePicker(){
        OneDrive.open(odOptions);
    }


    function _renderFiles(files){
        files = files || [];

        if(files.length > 0){
            var newDom = files.map(_getRenderFileDom)
                .join('\n');
            $('#files').html(newDom)
        } else {
            $('#files').text('No files Selected, Please select some files to migrate')
        }

        // update the other status
        // adjust the submit state...
        var selected_items_count = $('.file-checkbox:checked').length;
        $('#notification').hide()
        var should_disable_button = false;
        if(selected_items_count === 0){
            should_disable_button = true;
            $('#label-submit-count').empty()
        } else if(selected_items_count >= window.MAX_ALLOWED_FILES){
            should_disable_button = true;
            $('#notification').show()
                .text('Please select less than ' + window.MAX_ALLOWED_FILES + ' files');
            $('#label-submit-count').empty()
        } else {
            $('#label-submit-count').text('(' + selected_items_count + ' Files)')
        }

        if(should_disable_button){
            $('#btn-submit').attr('disabled', 'true');
        } else {
            $('#btn-submit').removeAttr('disabled');
        }
    }

    function _getRenderFileDom(file){
        return `
            <div>
              <input class="file-checkbox"
                  type="checkbox"
                  style="padding: 10px; margin-right:10px;"
                  id="file-${file.id}"
                  data-value="${file.id}"
                  ${file.is_selected ? 'checked' : ''}
                  onchange="window.onFileSelectCheckboxChanged(event)" />
              <label for="file-${file.id}">${file.name} (${file.sizeString})</label>
            </div>
        `;
    }


    function _getCurrentFiles(){
        return Object.values(window.files_hash);
    }
})()
