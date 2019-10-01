import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

const perPage = 10;

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    stars: [],
    page: 1,
    loading: true,
    refreshing: false,
  };

  async componentDidMount() {
    this.loadMore();
  }

  loadMore = async () => {
    const { page, stars } = this.state;

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${page}&per_page=${perPage}`
    );
    const repoStars = await response;

    this.setState({
      stars: page >= 2 ? [...stars, ...repoStars.data] : repoStars.data,
      page: page + 1,
      loading: false,
      refreshing: false,
    });
  };

  refreshList = async () => {
    this.setState({ refreshing: true, stars: [], page: 1 }, this.loadMore);
  };

  handleNavigate = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#7159c1" size={50} />
        ) : (
          <Stars
            data={stars}
            onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
            // eslint-disable-next-line react/destructuring-assignment
            refreshing={this.state.refreshing} // Variável que armazena um estado true/false que representa se a lista está atualizando
            // Restante das props
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
            onEndReached={this.loadMore} // Função que carrega mais itens
            // Restante das props
            keyExtractor={star => String(star.id)}
            // o item é o star acima
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
