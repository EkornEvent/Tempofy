import SpotifyWebApi from "spotify-web-api-node";
import { TrackObject } from "./types";

export const getUserPlaylists = async (api: any) => {
    let requests = await createAllRequests(api, 'getUserPlaylists', undefined, 'items(uri,id,name)');
    const responses: any = await Promise.all(requests);
    const allItems = responses.map((data: any) => data.body.items).flat();
    return allItems;
}

export const getPlaylistTracks = async (api: SpotifyWebApi, allTempos: any, id: string) => {
    let requests = await createAllRequests(api, 'getPlaylistTracks', (id),'items(track(id,name,uri,artists(name)))', async (data: any) => {
        const trackList = data.body.items.map((data:any) => data.track).filter((data:any) => data && data.id != null);
        const idList = trackList.map((item: any) => item.id);
        const audioData = await api.getAudioFeaturesForTracks(idList);
        const newItems: TrackObject[] = trackList.map((item_1: any, index: number) => {
            const tempofyTempo = allTempos[item_1.id];
            const tempo = tempofyTempo ? tempofyTempo.tempo : (audioData.body.audio_features[index] ? audioData.body.audio_features[index].tempo : null);
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
