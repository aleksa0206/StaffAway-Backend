import 'dotenv/config';
import express from 'express';
import healthRoutes from './routes/healthRoutes';

const app = express();
const port = process.env.PORT

app.use(healthRoutes);

app.listen(port, () => {
    console.log('server radi na portu 4000');
});
