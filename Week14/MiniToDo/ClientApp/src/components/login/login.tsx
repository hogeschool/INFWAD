import styles from './login.module.css';

export default function Login() {
  return (
    <div className={styles.loginpage}>
      <h1>Login</h1>

      <div className={styles['loginpage-field']}>
        <label>Email:</label>
        <input type="email" required className={styles['loginpage-field-input']} />
      </div>

      <div className={styles['loginpage-field']}>
        <label>Password:</label>
        <input type="password" required className={styles['loginpage-field-input']} />
      </div>

      <div className={styles['loginpage-button']}>
        <button type="submit">Login</button>
      </div>
    </div>
  )
}