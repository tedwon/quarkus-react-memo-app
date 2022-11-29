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
        memoSet.add(new Memo("Pick up Sara at 2:45 pm"));
    }

    @GET
    public Set<Memo> get() {
        return memoSet;
    }

    @GET
    @Path("contains/{memo}")
    public Boolean contains(String memo) {
        return memoSet.contains(new Memo(memo));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> create(Memo memo) {
        memoSet.add(memo);
        return memoSet;
    }

    @POST
    @Path("update/{memo}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> update(String memo, Memo newMemo) {
        memoSet.remove(new Memo(memo));
        memoSet.add(newMemo);
        return memoSet;
    }

    @DELETE
    @Consumes(MediaType.APPLICATION_JSON)
    public Set<Memo> delete(Memo memo) {
        memoSet.remove(memo);
        return memoSet;
    }
}