Module.register("MMM-Unsplash", {
	defaults: {
		opacity: 0.3,
		collections: "",
		width: 1080,
		height: 1920,
		orientation: "portrait",
		apiKey: "",
		updateInterval: 1800,
		divName: "mmm-unsplash-placeholder",
		showDescription: false,
		showAttribution: false,
		userPresenceAction: "none",
	},

	start: function() {
		this.load()
	},

	load: function() {
		var self = this

		var req = new XMLHttpRequest()
		var params = {
			collections: self.config.collections,
			orientation: self.config.orientation,
		}

		req.addEventListener("load", function() {
			if (this.status == 200) {
				var obj = JSON.parse(this.responseText)
				var img1 = document.getElementById(self.config.divName + "1")
				var img2 = document.getElementById(self.config.divName + "2")

				const imgDescription = obj.description ? obj.description : obj.alt_description;
				
				img1.addEventListener("load", function() {
					fade(img1, self.config.opacity, function() {
						img1.id = self.config.divName + "2"
					})

					fade(img2, 0, function() {
						img2.id = self.config.divName + "1"
					})
				})

				img1.src = obj.urls.raw + "&w=" + self.config.width + "&h=" + self.config.height + "&fit=crop"

				if (self.config.showAttribution) {
                                        const attrNameElement = document.getElementById("mmm-unsplash-attribution_name");
                                        attrNameElement.innerHTML += obj.user.name;

                                        const attrImgElement = document.getElementById("mmm-unsplash-attribution_image-img");
                                        attrImgElement.src = obj.user.profile_image.small;
                                }

                                if (self.config.showDescription) {
                                        const descElement = document.getElementById("mmm-unsplash-description");

                                        if (imgDescription) {
                                                descElement.innerHTML += imgDescription;
                                        }

                                        if (obj.location.name) {
                                                if (imgDescription) {
                                                        descElement.innerHTML += "<br>";
                                                }
                                                descElement.innerHTML += "<span class='xsmall'>" +  obj.location.name + "</span>";
                                        }
                                }
			}
		})

		req.open("GET", "https://api.unsplash.com/photos/random" + formatParams(params))
		req.setRequestHeader("Accept-Version", "v1")
		req.setRequestHeader("Authorization", "Client-ID " + this.config.apiKey)
		req.send()

		function checkAndLoad() {
                        if (!self.hidden) {
                                self.load();
                        } else {
                                console.log('MMM-Unsplash is Suspended, Waiting to resume');
                                setTimeout(checkAndLoad, (self.config.updateInterval * 1000));
                        }
                }


                setTimeout(checkAndLoad, (self.config.updateInterval * 1000));

	getDom: function() {
		var wrapper = document.createElement("div")
		wrapper.innerHTML = "<img id=\"" + this.config.divName + "1\" style=\"opacity: 0; height:100%; width:100%; object-fit:cover; position: absolute; top: 0\" /><img id=\"" + this.config.divName + "2\" style=\"opacity: 0; height:100%; width:100%; object-fit:cover; position: absolute; top: 0\" />"

		if (this.config.showDescription) {
                        const div = document.createElement("div");
                        div.style = "max-width: 640px; margin: 60px; bottom: 0px; right: 0px; position: absolute; text-align: right;";
                        div.id = "photoDescription";
                        var sTitle = document.createElement("p");
                        sTitle.style = "mix-blend-mode: difference; margin: 0; padding: 0; line-height: 1;";
                        sTitle.innerHTML = "PHOTO DESCRIPTION";
                        sTitle.className = "xsmall";

                        var divider = document.createElement("hr");
                        divider.style = "margin: 0px 0px 4px; padding: 0; border-color: rgba(255, 255, 255, 0.6);";

                        var desc = document.createElement("p");
                        desc.style = "mix-blend-mode: difference; margin: 0; padding: 0; line-height: 1; text-overflow: ellipsis;";
                        desc.id = "mmm-unsplash-description";
                        desc.className = "small light bright";

                        div.appendChild(sTitle);
                        div.appendChild(divider);
                        div.appendChild(desc);

                        wrapper.appendChild(div);
                }


                if (this.config.showAttribution) {
                        const div = document.createElement("div");
                        div.style = "display:flex; align-items: center; max-width: 640px; margin: 60px; bottom: 0px; left: 0px; position: absolute; text-align: right;";
                        div.id = "userAttribution";

                        var uImg_img = document.createElement("img");
                        uImg_img.style = "border-radius: 50%; margin-right:10px;"
                        uImg_img.id = "mmm-unsplash-attribution_image-img";

                        var uName = document.createElement("p");
                        uName.style = "mix-blend-mode: difference; margin: 0; padding: 0; line-height: 1;";
                        uName.className = "small";
                        uName.id = "mmm-unsplash-attribution_name"

                        div.appendChild(uImg_img);
                        div.appendChild(uName);

                        wrapper.appendChild(div);
                }
		
		return wrapper
	}
	notificationReceived: function(notification, payload, sender) {
                var self = this;
        
                if (notification === "USER_PRESENCE") {
                        if (self.config.userPresenceAction === "show") {
                                payload ? self.show() : self.hide();
                        } else if (self.config.userPresenceAction === "hide") {
                                payload ? self.hide() : self.show();
                        }
                }
        },
})

function formatParams( params ){
	return "?" + Object
		.keys(params)
		.map(function(key){
			return key+"="+encodeURIComponent(params[key])
		})
		.join("&")
}

function fade(elem, target, done) {
	var opacity = parseFloat(elem.style.opacity)
	var out = opacity > target
	if (opacity > target) {
		opacity -= 0.05
	} else if (opacity < target) {
		opacity += 0.05
	}

	elem.style.opacity = opacity

	if ((!out && opacity < target) || (out && opacity > target)) {
		setTimeout(function() { fade(elem, target, done) }, 60)
	} else {
		elem.style.opacity = target
		done()
	}
}
