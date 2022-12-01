package sara.tedwon;

import sara.tedwon.models.Memo;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Path("/memo")
@Produces(MediaType.APPLICATION_JSON)
public class MemoResource {

    static final Set<Memo> memoSet = Collections.synchronizedSet(new HashSet<>());

    static {
        memoSet.add(new Memo("Pick up Sara at 2:45 pm", "Go to WESS this afternoon and meet Sara at the gate", "sara,wess"));
    }

    @GET
    public Set<Memo> get() {
        return memoSet;
    }

    @POST
    @Path("contains")
    public Boolean contains(Memo memo) {
        return memoSet.contains(memo);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> create(Memo memo) {
        memoSet.add(memo);
        return memoSet;
    }

    @DELETE
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> delete(Memo memo) {
        memoSet.remove(memo);
        return memoSet;
    }
}