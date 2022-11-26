package sara.tedwon;

import sara.tedwon.models.Memo;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.*;

@Path("/memo")
@Produces(MediaType.APPLICATION_JSON)
public class MemoResource {

    static final Set<Memo> memoSet = Collections.synchronizedSet(new HashSet<>());

    static {
        memoSet.add(new Memo("Pick up Sara at 2:45 pm"));
    }

    @GET
    public Set<Memo> get() {
        return memoSet;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Boolean create(Memo memo) {
        return memoSet.add(memo);
    }

    @DELETE
    @Consumes(MediaType.APPLICATION_JSON)
    public Boolean delete(Memo memo) {
        return memoSet.remove(memo);
    }
}