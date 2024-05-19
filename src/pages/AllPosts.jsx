import React, { useState, useEffect } from "react";
import databaseService from "../appwrite/db";
import { PostCard, Container } from "../components/index";

function AllPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    databaseService.getPosts([]).then((response) => {
      if (response) {
        setPosts(response.documents);
      }
    });
  }, []);

  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.map((post) => (
            <div className="p-2 w-1/4" key={post.$id}>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default AllPosts;
