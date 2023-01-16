import SpotifyWebApi from "spotify-web-api-node";
import { TrackObject } from "./types";

export const getUserPlaylists = async (api: any) => {
    let requests = await createAllRequests(api, 'getUserPlaylists', undefined, 'items(uri,id,name)');
    const responses: any = await Promise.all(requests);
    const allItems = responses.map((data: any) => data.body.items).flat();
    return allItems;
}

export const getTempofyPlaylist = async (api: any) => {
    const tempofyPlaylistName = 'Tempofy :: Sorted';
    const userPlaylists: any[] = await getUserPlaylists(api);
    let tempofyPlaylist = userPlaylists.find(a => a.name == tempofyPlaylistName);
    if(!tempofyPlaylist) {
        tempofyPlaylist = await api.createPlaylist(tempofyPlaylistName, {'description': 'Tempofy dynamic queue', 'public': false})
    }
    return tempofyPlaylist;
}

export const resetTempofyPlaylist = async (api: any, tempofyPlaylist: any) => {
    const tracks = await getPlaylistTracks(api, tempofyPlaylist.id);
    const trackUris = tracks.map((track:TrackObject) => ({
        uri: track.uri
    }));
    const chunkSize = 100;
    if(trackUris.length > 0) {
        for (let i = 0; i < trackUris.length; i += chunkSize) {
            const chunk = trackUris.slice(i, i + chunkSize);
            if(chunk.length > 0) {
                await api.removeTracksFromPlaylist(tempofyPlaylist.id, chunk)
            }
        }
    }
}

export const updateTempofyPlaylist = async (api: any, tempofyPlaylist: any, tracks: TrackObject[]) => {
    const trackUris = tracks.map((track:TrackObject) => track.uri);
    const chunkSize = 100;
    if(trackUris.length > 0) {
        for (let i = 0; i < trackUris.length; i += chunkSize) {
            const chunk = trackUris.slice(i, i + chunkSize);
            if(chunk.length > 0) {
                await api.addTracksToPlaylist(tempofyPlaylist.id, chunk)
            }
        }
    }
}

export const getPlaylistTracks = async (api: SpotifyWebApi, id: string) => {
    let requests = await createAllRequests(api, 'getPlaylistTracks', (id),'items(track(id,name,uri,artists(name)))', async (data: any) => {
        const trackList = data.body.items.map((data:any) => data.track).filter((data:any) => data && data.id != null);
        const idList = trackList.map((item: any) => item.id);
        const audioData = await api.getAudioFeaturesForTracks(idList);
        const newItems: TrackObject[] = trackList.map((item_1: any, index: number) => {
            const tempo = audioData.body.audio_features[index] ? audioData.body.audio_features[index].tempo : null;
            return {
                ...item_1,
                tempo: tempo ? parseInt(tempo.toString()) : null
            };
        });
        return newItems;
    } );
    
    const responses: any = await Promise.all(requests);
    const allItems = responses.flat();
    return allItems;
}

const createAllRequests = async (api: any, request: string, args: any, fields?: string, onRequestComplete?: any) => {
    const response: any = await api[request](args, {
        fields: 'total,limit'
    });
    var requests = [];
    const numRequests = Math.ceil(response.body.total/response.body.limit);
    
    var count = 0;
    do {
        requests.push(
            api[request](args, {
                offset: count*parseInt(response.body.limit),
                limit: response.body.limit,
                fields: fields
            }).then(onRequestComplete)
        )
        count++
    } while (count < numRequests)
    return requests;
}
