# Data-Analytic-Web-Application
MVC, jQuery, ECharts, node.js, mongodb

Screen shots of the website are in public/images.

1. MVC structure
    1. routes:
        contains routes for both input URL and API query.
    2. models:
        'dbConnect.js ' only involves database connection;
        'DataAnalyticModel.js' involves static methods for any required database query.
    3. controllers:
        contains controllers according to router.
    4. views:
        this folder only contains .ejs files for main page and only used for back end render.

2. front end resources in 'public' directory
    1. components: 
        the whole page is divided into three components: 
        left_overall, right_overall, individual. 
        each component has its .ejs file, .js file and .css file,
        which are stored in 'javascripts' and 'stylesheets' separately.
        .ejs files in this folder are used for front end render.
    2. images: 
        stores static resources such as logo image and screen shot of the whole page.
    3. javascripts: 
        'DataAnalyticMain.js' is the js file of the main page;
        js files in 'components' folder are for different components; 
        js files in 'external' folder are for external javascript library.
    4. stylesheets:
        'baseStyleSheet.css' is the base css file for the whole website;
        'DataAnalyticMain.css' is the css file of the main page;
        css files in 'components' folder are for different components; 
        css files in 'external' folder are stylesheets of external library.

