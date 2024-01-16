const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const User = require("./model/user");
const Product = require("./model/Product");
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs').promises;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose
  .connect("mongodb://127.0.0.1:27017/MOB18201", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối tới MongoDB thành công.");
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối tới MongoDB: " + err);
  });



 
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const port = process.env.port || 3001;


app.set('view engine', 'ejs');// cấu hình engine ejs
app.set("views", path.join(__dirname, "views"));

app.get('/home',(req, res)=>{
  console.log(__dirname);
 res.render("Home.ejs");
})
app.get('/signup',(req, res)=>{
    console.log(__dirname);
   res.render("Signup.ejs");
})
app.get('/login',(req, res)=>{
    console.log(__dirname);
   res.render("Login.ejs");
})

app.get('/insert',(req, res)=>{
    console.log(__dirname);
   res.render("Insert.ejs");
})


app.post('/user',async(req, res)=>{
    console.log(req.body);
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword,
    });
    try{
        const result = await newUser.save();
        res.json(result);
    }catch(error){
        console.log(error);
    }
});


app.post('/product', upload.array('image', 2), async (req, res) => {
  try {
    console.log('Received request:', req.body);
    if (!req.files || req.files.length < 1 || req.files.length > 2) {
      return res.status(400).json({ error: 'Please provide 1 to 2 image files.' });
    }
    
    console.log('Received files:', req.files);

    const imagePaths = [];
    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index];
      const fileName = file.originalname || `file_${index + 1}.jpg`;
      const imagePath = path.join(__dirname, 'uploads', fileName);
      const fileNameOnly = path.basename(imagePath);
      console.log(imagePath)
      // Lưu tệp ảnh vào thư mục "uploads"
      await fs.writeFile(imagePath, file.buffer);
      // Lưu đường dẫn vào mảng
      imagePaths.push(fileNameOnly);
    }

    // Lưu thông tin sản phẩm vào MongoDB với danh sách đường dẫn
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      year: req.body.year,
      number: req.body.number,
      imagePaths: imagePaths, // Lưu danh sách đường dẫn tệp ảnh
    });

    const result = await newProduct.save();
    res.json(result);
  } catch (error) {
    res.status(500).send('Internal Server Error');
}
});



app.get('/list', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('List.ejs', { products: products });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list1', async (req, res) => {
  try {
    const products = await Product.find().lean();
   
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});








app.delete('/product/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await Product.findByIdAndDelete(productId);

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      // Kiểm tra mật khẩu bằng cách so sánh với mật khẩu trong cơ sở dữ liệu
      if (user.password === password) {
        // Đăng nhập thành công, chuyển hướng đến trang /list
        res.status(200).send('Đăng nhập thành công!');
      } else {
        // Mật khẩu không hợp lệ
        res.status(401).send('Mật khẩu không hợp lệ.');
      }
    } else {
      // Tài khoản không tồn tại
      res.status(401).send('Tài khoản không tồn tại.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi server.');
  }
});

//Cập nhật số lượng
const router = express.Router();
router.post('/update-quantity', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (quantity <= product.number) {
      // Cập nhật số lượng sản phẩm trên server
      product.number -= quantity;
      await product.save();

      // Trả về thông báo cập nhật thành công
      res.status(200).json({ message: 'Quantity updated successfully.' });
    } else {
      // Xử lý khi số lượng mua vượt quá số lượng có sẵn
      res.status(400).json({ error: 'Not enough quantity available.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
// Định nghĩa endpoint để lấy toàn bộ sản phẩm
app.get('/api/products', async (req, res) => {
  try {
      const products = await Product.find(); 
      res.json(products); 
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Thiết lập cổng cho sever
app.listen(port, ()=>{
    console.log(` server running at the port ${port}`);

});
