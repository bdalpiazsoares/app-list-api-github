import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    newUser: '',
    users: [],
    loading: false,
    error: null,
  };

  // BUSCA OS DADOS ASSIM QUE INICIAR O APP
  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  // EXECUTA QUANDO HOUVER ALTERAÇÕES NA VARIÁVEL USERS, IRÁ SALVAR
  async componentDidUpdate(_, prevState) {
    const { users } = this.state;
    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true, error: false });

    const response = await api.get(`/users/${newUser}`);

    const data = {
      name: response.data.name,
      login: response.data.login,
      bio: response.data.bio,
      avatar: response.data.avatar_url,
    };

    try {
      const hasUser = users.find(u => u.login === data.login);
      if (hasUser) throw 'Usuário já Adicionado';

      this.setState({
        /* seta um novo estado pegando todos os users já salvos
        e adicionando mais o user que está no data, que eu peguei da api */
        users: [...users, data],
        newUser: '',
      });
      Keyboard.dismiss(); // faz o teclado sumir quando adiciona o user.
    } catch (error) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    // direciona para a página User do respectivo usuário
    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading, error } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCaptalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
            error={error}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login} // key - propriedade unica
          renderItem={({ item }) => (
            // o item é o user acima
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
