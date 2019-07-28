import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, SafeAreaView, ListRenderItem, ActivityIndicator } from 'react-native';
import { ListItem, Text, Button } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
import Data from 'api/Data';
import { Playlist } from 'api/Types';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {

  }
});

const PlaylistScreen = () => {
  const { navigate } = useNavigation();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isListEnd, setIsListEnd] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const limit: number = 50;
  
  useEffect(() => {
    loadPlaylists();
  },[offset]);

  async function loadPlaylists() {
    setIsFetching(true);
    const result: any = await Data.getUserPlaylists(offset,limit);
    const newList: Playlist[] = playlists.concat(result.items);
    setPlaylists(newList);
    setIsFetching(false);
    
    if(offset >= result.total) {
      setIsListEnd(true);
    }
  }

  function onPress(item: Playlist) {
    navigate('Tracks', {playlistId: item.id, title: item.name})
  };

  function loadMoreData() {
    if (!isFetching && !isListEnd) {
      setOffset(offset+limit);
    }
};

  const _keyExtractor = (item: Playlist, index: number) => item.id+index.toString();
  const _renderItem = ({ item }: { item: Playlist }) => (
    <ListItem 
      title={item.name} 
      onPress={() => onPress(item)}
    />
  );
  const _renderFooter = () => (
    <View style={styles.footer}>
      {isFetching && !isListEnd ? (
        <ActivityIndicator />
      ) : null}
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={playlists}
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        onEndReached={() => loadMoreData()}
        ListFooterComponent={_renderFooter}
      />
    </SafeAreaView>
  )
}

export default PlaylistScreen;
