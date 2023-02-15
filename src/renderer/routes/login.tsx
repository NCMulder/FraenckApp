// import els from '../../../assets/images/UserImages/mohammad.jpg';
import { Link } from 'react-router-dom';
import mo from '../../../assets/images/UserImages/mohammad.jpg';
// import mu from '../../../assets/images/UserImages/muhannad.webp';

const users = [
  {
    name: 'Elsbeth',
    icon: mo,
  },
  {
    name: 'Pascal',
    icon: mo,
  },
  {
    name: 'Liduïn',
    icon: mo,
  },
  {
    name: 'Niels',
    icon: mo,
  },
];

function UserBlob(props: any) {
  const { name, image } = props;
  return (
    <div className="user">
      <img src={image} alt={`${name}`} className="profile-image" />
      <div className="user-name">{name}</div>
    </div>
  );
}

function Huh() {
  window.electron.getOrders.getOrders();
}

function Login() {
  window.electron.ipcRenderer.sendMessage('ipc-example', ['bla']);
  window.electron.getOrders.once('get-orders', (o) => console.log(o));

  return (
    <div>
      <div>Login</div>
      <Link to="/orders">Orders</Link>
      <button onClick={Huh} type="button">
        Help
      </button>
      <div className="login-list">
        {users.map((user) => (
          <UserBlob name={user.name} image={user.icon} key={user.name} />
        ))}
      </div>
    </div>
  );
}

export default Login;
