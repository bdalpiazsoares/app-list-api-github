import Reactotron from 'reactotron-react-native';
/* __ DEv __ retorna true quando o usuario está emulando a aplicação
 dele em ambiente de desenvolvimento. Tudo que estiver dentro do if
 não irá executar em ambiente de produção */
// o host é o ip do computador
if (__DEV__) {
  const tron = Reactotron.configure({ host: '192.168.0.120' })
    .useReactNative()
    .connect();

  /* atribui o tron à com a variavel global console,
  permitindo mandar para o ambiente do reactotron os logs */
  console.tron = tron;

  tron.clear(); // sempre que der um reload ele limpa o ambiente.
}
