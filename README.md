_This repo contains the source code behind Rishi's website. This is a personal website. It probably doesn't make sense for you to use the source as-is. Instead, feel free to take bits and peices if you find it useful._

# Install:
1. Deploy this root directory to a directory on your
   web-server
2. Optionally rename the root directory to something
   of your choosing

# Run:
1. Using a web-browser, navigate to:
   http://<your_web_server>/<root_dir>/index.html
   
# Modify:
- To modify the styles / appearance, see: `css/main.css`
- To add new row panel to the main page:
  1. Create a new row panel `div` style within `css/main.css` - see examples at the bottom
  2. Ensure you have a preview image specified within the CSS, and the image placed within `img/<section>/`
  2. Duplicate an existing row panel within `index.html` and customize the text with your own content, while referencing the custom CSS ID specified in step 1.
- Always ensure the Last Updated field at the bottom of `index.html` is up-to-date
