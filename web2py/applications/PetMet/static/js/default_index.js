var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.get_users = function() {
        $.getJSON(get_users_url, function(data) {
                self.vue.users = data.users;
                self.vue.images = data.images;
                self.vue.logged_in = data.logged_in;
                // console.log(self.vue.logged_in);
                enumerate(self.vue.users);
            })
    };

    self.get_pet_posts = function(user_id) {
        console.log(user_id);
        $.getJSON(usr_img_url, 
            {
                user_id
            },
            function(data) {
                //self.vue.images = data.images;
                self.vue.show_img.unshift(data.show_img);
                enumerate(self.vue.images);
            })
    };

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = document.getElementById("file_input").files[0];
        // var type = form[1].value;
        // var name = form[2].value;
        // var descr = form[3].value;
        // var contact = form[4].value;
        // We want to read the image file, and transform it into a data URL.
        var reader = new FileReader();

        
        reader.addEventListener("load", function () {
            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            // Reads the file as a data URL.
            reader.readAsDataURL(file);
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.vue.show_img = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        setTimeout(function() {
            $.post(add_image_url, 
            {
                image_url: get_url,
                animal_type: self.vue.animal_type,
                pet_name: self.vue.pet_name,
                description: self.vue.description,
                contact_info: self.vue.contact_info
            },
            function(data) {
                //$.web2py.enableElement($("#add_image_url"));
                self.vue.show_img.unshift(data.pet_posts);
                console.log(self.vue.show_img);
                enumerate(self.vue.show_img);
                self.get_pet_posts;
            });
        }, 900);
    };

  


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            users: [],
            images: [], 
            logged_in: false,
            is_uploading: false,
            img_url: null,
            self_page: true ,
            show_img: false,
            animal_type: " ",
            pet_name: " ",
            description: " ",
            contact_info: " "
            
           
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            get_users: self.get_users,
            get_pet_posts: self.get_pet_posts
      
        }

    });

    self.get_users();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

